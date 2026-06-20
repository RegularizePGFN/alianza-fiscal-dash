import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key, content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CHATWOOT_BASE_URL = "https://chatwoot.neumocrm.com.br";
const CHATWOOT_ACCOUNT_ID = 1;
const KANBAN_FUNNEL_ID = 2;

// Mapeamento automation_status → kanban stage
const STATUS_TO_STAGE: Record<string, string | null> = {
  success: "stage_4",    // Cadastro pronto
  error: "stage_3",      // Em processamento
  processing: "stage_3", // Em processamento
  pending: "stage_3",    // Em processamento
};

// Etapas "iniciais" — kanban só avança, nunca volta
const INITIAL_STAGES = new Set(["stage_1", "stage_3"]);

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function findKanbanItemId(
  conversationId: number,
  chatwootToken: string,
): Promise<{ id: number; currentStage: string } | null> {
  for (let page = 1; page <= 10; page++) {
    const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/kanban_items?funnel_id=${KANBAN_FUNNEL_ID}&page=${page}&per_page=50`;
    const resp = await fetch(url, { headers: { api_access_token: chatwootToken } });
    if (!resp.ok) return null;
    const json = await resp.json() as { data?: any[]; payload?: any[] };
    const items: any[] = json.data ?? json.payload ?? (json as any).items ?? [];
    if (items.length === 0) break;
    const found = items.find(
      (it: any) =>
        it.conversation?.display_id === conversationId ||
        it.conversation?.id === conversationId,
    );
    if (found) {
      return {
        id: found.id,
        currentStage: found.stage ?? found.kanban_stage ?? "stage_1",
      };
    }
    if (items.length < 50) break;
  }
  return null;
}

async function moveKanban(
  conversationId: number,
  targetStage: string,
  chatwootToken: string,
): Promise<"moved" | "skipped" | "not_found" | "error"> {
  const item = await findKanbanItemId(conversationId, chatwootToken);
  if (!item) return "not_found";

  // Só move se o item ainda estiver em uma etapa inicial
  // (nunca voltar de Proposta enviada para Cadastro pronto, por exemplo)
  if (!INITIAL_STAGES.has(item.currentStage)) {
    return "skipped";
  }
  // Se já está na etapa destino, não precisa mover
  if (item.currentStage === targetStage) {
    return "skipped";
  }

  const moveUrl = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/kanban_items/${item.id}/move_to_stage`;
  const moveResp = await fetch(moveUrl, {
    method: "POST",
    headers: { api_access_token: chatwootToken, "Content-Type": "application/json" },
    body: JSON.stringify({ stage_id: targetStage }),
  });
  return moveResp.ok ? "moved" : "error";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const chatwootToken = Deno.env.get("CHATWOOT_API_TOKEN") ?? "";
  if (!chatwootToken) {
    return new Response(JSON.stringify({ error: "CHATWOOT_API_TOKEN not set" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── MODO 1: Database Webhook ──────────────────────────────────────────────
  // Payload: { type, table, record: { conversation_id, automation_status, ... } }
  if (body?.type === "UPDATE" && body?.table === "client_registrations") {
    const record = body.record ?? {};
    const oldRecord = body.old_record ?? {};

    // Só age se automation_status realmente mudou
    if (record.automation_status === oldRecord.automation_status) {
      return new Response(JSON.stringify({ ok: true, action: "no_change" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const conversationId = record.conversation_id;
    const targetStage = STATUS_TO_STAGE[record.automation_status];

    if (!conversationId || !targetStage) {
      return new Response(JSON.stringify({ ok: true, action: "ignored", reason: "no_conversation_id_or_unmapped_status" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await moveKanban(Number(conversationId), targetStage, chatwootToken);
    console.log(`[kanban-status-sync] webhook conv=${conversationId} status=${record.automation_status} → ${targetStage}: ${result}`);

    return new Response(JSON.stringify({ ok: true, action: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── MODO 2: Backfill manual (chamada direta com x-api-key) ───────────────
  const expected = Deno.env.get("AUTOMATION_API_KEY") ?? "";
  const got = req.headers.get("x-api-key") ?? "";
  if (!expected || !timingSafeEqual(got, expected)) {
    return new Response(JSON.stringify({ error: "invalid api key" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Busca todos os registros com conversation_id
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: registrations, error: dbErr } = await supabase
    .from("client_registrations")
    .select("conversation_id, automation_status, client_name")
    .not("conversation_id", "is", null);

  if (dbErr) {
    return new Response(JSON.stringify({ error: dbErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = { moved: 0, skipped: 0, not_found: 0, error: 0 };
  const log: string[] = [];

  for (const reg of registrations ?? []) {
    const targetStage = STATUS_TO_STAGE[reg.automation_status];
    if (!targetStage || !reg.conversation_id) {
      results.skipped++;
      continue;
    }
    const outcome = await moveKanban(Number(reg.conversation_id), targetStage, chatwootToken);
    results[outcome]++;
    if (outcome === "moved") {
      log.push(`✅ ${reg.client_name ?? `conv ${reg.conversation_id}`} → ${targetStage}`);
    }
  }

  console.log("[kanban-status-sync] backfill concluído", results);
  return new Response(JSON.stringify({ ok: true, results, log }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
