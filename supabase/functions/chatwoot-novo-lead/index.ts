import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Valida dígitos verificadores do CNPJ
function isValidCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (base: string) => {
    let len = base.length;
    let sum = 0;
    let pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(base.charAt(len - i), 10) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const d1 = calc(cnpj.substring(0, 12));
  if (d1 !== parseInt(cnpj.charAt(12), 10)) return false;
  const d2 = calc(cnpj.substring(0, 13));
  return d2 === parseInt(cnpj.charAt(13), 10);
}

function extractCnpj(text: string): string | null {
  if (!text) return null;
  const re = /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g;
  const matches = text.match(re) ?? [];
  for (const m of matches) {
    const digits = m.replace(/\D/g, "");
    if (digits.length === 14 && isValidCnpj(digits)) return digits;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  // Auth via segredo no header
  const expected = Deno.env.get("CHATWOOT_WEBHOOK_SECRET");
  const provided = req.headers.get("x-webhook-secret");
  if (!expected || provided !== expected) {
    console.warn("[chatwoot-novo-lead] unauthorized request");
    return json(401, { error: "unauthorized" });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (_e) {
    return json(400, { error: "invalid json" });
  }

  try {
    const event = payload?.event;
    const messageType = payload?.message_type;

    if (event !== "message_created" || messageType !== "incoming") {
      return json(200, { ok: true, ignorado: true, reason: "event_filtered" });
    }

    const content: string = payload?.content ?? "";
    const cnpj = extractCnpj(content);
    if (!cnpj) {
      return json(200, { ok: true, ignorado: true, reason: "no_cnpj" });
    }

    const conversation = payload?.conversation ?? {};
    const conversationId: number | null = conversation?.id ?? null;
    const phone: string | null =
      conversation?.meta?.sender?.phone_number ??
      payload?.sender?.phone_number ??
      null;
    const assigneeName: string | null =
      conversation?.meta?.assignee?.name ?? null;
    const clientName: string | null =
      conversation?.meta?.sender?.name ?? payload?.sender?.name ?? null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotência por conversation_id
    if (conversationId !== null) {
      const { data: existing, error: selErr } = await supabase
        .from("client_registrations")
        .select("id")
        .eq("conversation_id", conversationId)
        .maybeSingle();

      if (selErr) {
        console.error("[chatwoot-novo-lead] select error", selErr);
        return json(500, { error: "db_select_failed", detail: selErr.message });
      }
      if (existing) {
        return json(200, { ok: true, cadastro_id: existing.id, duplicado: true });
      }
    }

    const insertRow = {
      cnpj,
      cpf: null,
      client_name: clientName,
      client_phone: phone,
      salesperson_id: null,
      salesperson_name: assigneeName,
      reason: "fazer_cadastro",
      status: "aguardando",
      source: "chatbot",
      conversation_id: conversationId,
    };

    const { data: inserted, error: insErr } = await supabase
      .from("client_registrations")
      .insert(insertRow)
      .select("id")
      .single();

    if (insErr) {
      console.error("[chatwoot-novo-lead] insert error", insErr, insertRow);
      return json(500, { error: "db_insert_failed", detail: insErr.message });
    }

    console.log("[chatwoot-novo-lead] created", {
      id: inserted.id,
      conversation_id: conversationId,
      cnpj,
    });

    return json(200, { ok: true, cadastro_id: inserted.id });
  } catch (e) {
    console.error("[chatwoot-novo-lead] unhandled", e);
    return json(500, { error: "internal", detail: String(e?.message ?? e) });
  }
});
