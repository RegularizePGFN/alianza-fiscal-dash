import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key, content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20;

const FileSchema = z.object({
  name: z.string().min(1).max(255),
  content_base64: z.string().min(1),
});

const SimulationStatusSchema = z.enum(["success", "no_debts", "error", "pending"]);

const BodySchema = z.discriminatedUnion("status", [
  z.object({
    registration_id: z.string().uuid(),
    status: z.literal("success"),
    files: z.array(FileSchema).max(MAX_FILES).optional().default([]),
    screenshots: z.array(FileSchema).max(MAX_FILES).optional().default([]),
    simulation_status: SimulationStatusSchema.optional(),
  }),
  z.object({
    registration_id: z.string().uuid(),
    status: z.literal("error"),
    error_message: z.string().min(1).max(2000),
  }),
]);

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function decodeBase64(b64: string): Uint8Array {
  // Strip data url prefix if present
  const clean = b64.replace(/^data:[^;]+;base64,/, "");
  const bin = atob(clean);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

const CHATWOOT_BASE_URL = "https://chatwoot.neumocrm.com.br";
const CHATWOOT_ACCOUNT_ID = 1;
const KANBAN_FUNNEL_ID = 2;
// stage_3 = Em processamento, stage_4 = Cadastro pronto
const STAGE_EM_PROCESSAMENTO = "stage_3";
const STAGE_CADASTRO_PRONTO = "stage_4";

async function moveKanbanToStage(
  conversationId: number,
  targetStage: string,
  chatwootToken: string,
): Promise<void> {
  try {
    // Busca kanban items do funil para encontrar o item dessa conversa
    // Tenta até 5 páginas (250 itens) para não ficar preso em loop infinito
    for (let page = 1; page <= 5; page++) {
      const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/kanban_items?funnel_id=${KANBAN_FUNNEL_ID}&page=${page}&per_page=50`;
      const resp = await fetch(url, {
        headers: { api_access_token: chatwootToken },
      });
      if (!resp.ok) {
        console.warn("[kanban] list failed", resp.status);
        return;
      }
      const json = await resp.json() as { data?: any[]; payload?: any[] };
      const items: any[] = json.data ?? json.payload ?? [];
      if (items.length === 0) break;

      const found = items.find(
        (item: any) =>
          item.conversation?.display_id === conversationId ||
          item.conversation?.id === conversationId,
      );
      if (found) {
        // Só move se o item ainda estiver nas etapas iniciais
        const currentStage = found.stage ?? found.kanban_stage ?? "";
        const initialStages = ["stage_1", "stage_3"];
        // Para sucesso: mover de qualquer etapa inicial para cadastro_pronto
        // Para erro: mover só se ainda estiver em novo_lead (stage_1)
        const shouldMove =
          targetStage === STAGE_CADASTRO_PRONTO
            ? initialStages.includes(currentStage)
            : currentStage === "stage_1";

        if (!shouldMove) {
          console.log(`[kanban] item ${found.id} já está em ${currentStage}, pulando`);
          return;
        }

        const moveUrl = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/kanban_items/${found.id}/move_to_stage`;
        const moveResp = await fetch(moveUrl, {
          method: "POST",
          headers: {
            api_access_token: chatwootToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stage_id: targetStage }),
        });
        if (!moveResp.ok) {
          const text = await moveResp.text().catch(() => "");
          console.error("[kanban] move failed", moveResp.status, text);
        } else {
          console.log(`[kanban] item ${found.id} movido para ${targetStage}`);
        }
        return;
      }

      if (items.length < 50) break; // última página
    }
    console.warn(`[kanban] item não encontrado para conversation_id=${conversationId}`);
  } catch (e) {
    console.error("[kanban] moveKanbanToStage error", e);
  }
}

Deno.serve(async (req) => {
  try {
    return await handle(req);
  } catch (e) {
    console.error("[automation-result] uncaught", e instanceof Error ? e.stack || e.message : String(e));
    return new Response(JSON.stringify({ error: "internal", message: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const expected = Deno.env.get("AUTOMATION_API_KEY") ?? "";
  const got = req.headers.get("x-api-key") ?? "";
  if (!expected || !timingSafeEqual(got, expected)) {
    return new Response(JSON.stringify({ error: "invalid api key" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "validation", details: parsed.error.flatten() }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const body = parsed.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: reg, error: regErr } = await supabase
    .from("client_registrations")
    .select("id, automation_status, client_name, conversation_id")
    .eq("id", body.registration_id)
    .maybeSingle();
  if (regErr) {
    console.error("[automation-result] select reg err", regErr); return new Response(JSON.stringify({ error: regErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!reg) {
    return new Response(JSON.stringify({ error: "registration not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (reg.automation_status === "success" || reg.automation_status === "error") {
    return new Response(JSON.stringify({ error: "already finalized", current_status: reg.automation_status }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (body.status === "error") {
    const { error: uErr } = await supabase
      .from("client_registrations")
      .update({
        automation_status: "error",
        automation_finished_at: new Date().toISOString(),
        automation_error: body.error_message,
      })
      .eq("id", body.registration_id)
      .in("automation_status", ["pending", "processing"]);
    if (uErr) {
      console.error("[automation-result] update err", uErr); return new Response(JSON.stringify({ error: uErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Move kanban para "Em processamento"
    const chatwootToken = Deno.env.get("CHATWOOT_API_TOKEN");
    const conversationId = reg.conversation_id;
    if (conversationId && chatwootToken) {
      await moveKanbanToStage(conversationId, STAGE_EM_PROCESSAMENTO, chatwootToken);
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // LOCK ATÔMICO: só uma chamada concorrente consegue marcar como success.
  // As outras recebem 0 linhas afetadas e saem sem fazer upload nem enviar ao Chatwoot.
  const nowIso = new Date().toISOString();
  const lockUpdate: Record<string, unknown> = {
    automation_status: "success",
    automation_finished_at: nowIso,
    automation_error: null,
    status: "realizado",
    completed_at: nowIso,
  };
  if (body.simulation_status) {
    lockUpdate.simulation_status = body.simulation_status;
  }
  const { data: lockRows, error: lockErr } = await supabase
    .from("client_registrations")
    .update(lockUpdate)
    .eq("id", body.registration_id)
    .in("automation_status", ["pending", "processing"])
    .select("id");
  if (lockErr) {
    console.error("[automation-result] lock err", lockErr);
    return new Response(JSON.stringify({ error: lockErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!lockRows || lockRows.length === 0) {
    console.warn("[automation-result] concurrent call ignored", body.registration_id);
    return new Response(JSON.stringify({ ok: true, ignored: true, reason: "already_finalized_concurrent" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }



  async function uploadGroup(
    items: { name: string; content_base64: string }[],
    fileType: "pdf" | "screenshot",
    contentType: string,
  ): Promise<{ name: string; bytes: Uint8Array }[]> {
    const seen = new Set<string>();
    const unique = items.filter((f) => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });
    const inserted: { name: string; bytes: Uint8Array }[] = [];
    for (const f of unique) {
      let bytes: Uint8Array;
      try { bytes = decodeBase64(f.content_base64); } catch {
        console.error("[automation-result] invalid base64", fileType, f.name);
        continue;
      }
      if (bytes.byteLength > MAX_FILE_BYTES) {
        console.error("[automation-result] file exceeds 10MB", fileType, f.name);
        continue;
      }
      const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${body.registration_id}/${fileType}/${crypto.randomUUID()}-${safeName}`;

      const { error: insErr } = await supabase
        .from("client_registration_automation_files")
        .insert({
          registration_id: body.registration_id,
          file_path: path,
          file_name: f.name,
          file_type: fileType,
        });
      if (insErr) {
        if ((insErr as any).code === "23505") {
          console.warn("[automation-result] file already exists, skipping", fileType, f.name);
          continue;
        }
        console.error("[automation-result] insert file err", insErr);
        continue;
      }

      const { error: upErr } = await supabase.storage
        .from("cadastro-automatico-pdfs")
        .upload(path, bytes, { contentType, upsert: false });
      if (upErr) {
        console.error("[automation-result] upload err", upErr);
        await supabase
          .from("client_registration_automation_files")
          .delete()
          .eq("registration_id", body.registration_id)
          .eq("file_path", path);
        continue;
      }

      inserted.push({ name: f.name, bytes });
    }
    return inserted;
  }

  const insertedFiles = await uploadGroup(body.files, "pdf", "application/pdf");
  const insertedScreenshots = await uploadGroup(body.screenshots ?? [], "screenshot", "image/png");


  // UMA ÚNICA nota privada no Chatwoot com todos os PDFs novos anexados
  let chatwootNotesSent = 0;
  const chatwootToken = Deno.env.get("CHATWOOT_API_TOKEN");
  const conversationId = reg.conversation_id;
  if (conversationId && insertedFiles.length > 0 && chatwootToken) {
    const CHATWOOT_BASE_URL = "https://chatwoot.neumocrm.com.br";
    const CHATWOOT_ACCOUNT_ID = 1;
    const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`;
    try {
      const form = new FormData();
      form.append("content", "Relatório de dívidas gerado com sucesso. Segue em anexo.");
      form.append("private", "true");
      for (const df of insertedFiles) {
        form.append(
          "attachments[]",
          new File([df.bytes], df.name, { type: "application/pdf" }),
        );
      }
      const resp = await fetch(url, {
        method: "POST",
        headers: { api_access_token: chatwootToken },
        body: form,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        console.error("[automation-result] chatwoot send failed", resp.status, text);
      } else {
        chatwootNotesSent = 1;
      }
    } catch (e) {
      console.error("[automation-result] chatwoot send error", e);
    }
  } else if (insertedFiles.length > 0) {
    console.warn("[automation-result] skipped chatwoot send", {
      has_conversation_id: !!conversationId,
      has_token: !!chatwootToken,
    });
  }

  // Move kanban para "Cadastro pronto"
  if (conversationId && chatwootToken) {
    await moveKanbanToStage(conversationId, STAGE_CADASTRO_PRONTO, chatwootToken);
  }

  return new Response(JSON.stringify({ ok: true, files_saved: insertedFiles.length, screenshots_saved: insertedScreenshots.length, chatwoot_notes_sent: chatwootNotesSent }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
