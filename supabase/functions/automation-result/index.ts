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

const BodySchema = z.discriminatedUnion("status", [
  z.object({
    registration_id: z.string().uuid(),
    status: z.literal("success"),
    files: z.array(FileSchema).max(MAX_FILES).optional().default([]),
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
      .eq("id", body.registration_id);
    if (uErr) {
      console.error("[automation-result] update err", uErr); return new Response(JSON.stringify({ error: uErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // success — salvar arquivos
  // Dedupe por nome dentro do mesmo request (a automação às vezes envia o mesmo arquivo 2x)
  const seenNames = new Set<string>();
  const uniqueFiles = body.files.filter((f) => {
    if (seenNames.has(f.name)) {
      console.warn("[automation-result] duplicate file in request ignored", f.name);
      return false;
    }
    seenNames.add(f.name);
    return true;
  });

  // Também ignora arquivos já salvos anteriormente para esta registration (idempotência)
  const { data: existingFiles } = await supabase
    .from("client_registration_automation_files")
    .select("file_name")
    .eq("registration_id", body.registration_id);
  const existingNames = new Set((existingFiles ?? []).map((r: any) => r.file_name));

  const filesSaved: string[] = [];
  const decodedFiles: { name: string; bytes: Uint8Array }[] = [];
  for (const f of uniqueFiles) {
    if (existingNames.has(f.name)) {
      console.warn("[automation-result] file already saved previously, skipping", f.name);
      continue;
    }
    let bytes: Uint8Array;
    try { bytes = decodeBase64(f.content_base64); } catch {
      return new Response(JSON.stringify({ error: `invalid base64 for ${f.name}` }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (bytes.byteLength > MAX_FILE_BYTES) {
      return new Response(JSON.stringify({ error: `file ${f.name} exceeds 10MB` }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${body.registration_id}/${crypto.randomUUID()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("cadastro-automatico-pdfs")
      .upload(path, bytes, { contentType: "application/pdf", upsert: false });
    if (upErr) {
      console.error("[automation-result] upload err", upErr); return new Response(JSON.stringify({ error: `upload failed: ${upErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { error: insErr } = await supabase
      .from("client_registration_automation_files")
      .insert({ registration_id: body.registration_id, file_path: path, file_name: f.name });
    if (insErr) {
      console.error("[automation-result] insert file err", insErr); return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    filesSaved.push(path);
    decodedFiles.push({ name: f.name, bytes });
  }

  const { error: uErr } = await supabase
    .from("client_registrations")
    .update({
      automation_status: "success",
      automation_finished_at: new Date().toISOString(),
      automation_error: null,
      status: "realizado",
      completed_at: new Date().toISOString(),
    })
    .eq("id", body.registration_id);
  if (uErr) {
    console.error("[automation-result] update err", uErr); return new Response(JSON.stringify({ error: uErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Enviar PDFs como nota privada no Chatwoot (best effort — não falha a automação)
  let chatwootNotesSent = 0;
  const chatwootToken = Deno.env.get("CHATWOOT_API_TOKEN");
  const conversationId = reg.conversation_id;
  if (conversationId && decodedFiles.length > 0 && chatwootToken) {
    const CHATWOOT_BASE_URL = "https://chatwoot.neumocrm.com.br";
    const CHATWOOT_ACCOUNT_ID = 1;
    const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`;
    for (let i = 0; i < decodedFiles.length; i++) {
      const df = decodedFiles[i];
      try {
        const form = new FormData();
        form.append("content", i === 0 ? "Relatório de dívidas gerado com sucesso. Segue em anexo." : "");
        form.append("private", "true");
        form.append(
          "attachments[]",
          new File([df.bytes], df.name, { type: "application/pdf" }),
        );
        const resp = await fetch(url, {
          method: "POST",
          headers: { api_access_token: chatwootToken },
          body: form,
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          console.error("[automation-result] chatwoot send failed", resp.status, text);
        } else {
          chatwootNotesSent++;
        }
      } catch (e) {
        console.error("[automation-result] chatwoot send error", e);
      }
    }
  } else if (decodedFiles.length > 0) {
    console.warn("[automation-result] skipped chatwoot send", {
      has_conversation_id: !!conversationId,
      has_token: !!chatwootToken,
    });
  }

  return new Response(JSON.stringify({ ok: true, files_saved: filesSaved.length, chatwoot_notes_sent: chatwootNotesSent }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
