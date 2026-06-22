import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key, content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
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

  const body = await req.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ error: "json inválido" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { cnpj, conversation_id } = body;

  if (!cnpj || !conversation_id) {
    return new Response(JSON.stringify({ error: "cnpj e conversation_id são obrigatórios" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Normaliza o CNPJ (só dígitos)
  const cnpjDigits = String(cnpj).replace(/\D/g, "");
  if (cnpjDigits.length !== 14) {
    return new Response(JSON.stringify({ error: "cnpj inválido" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Busca o registro pelo CNPJ (pode ter pontuação na tabela, tenta as duas formas)
  const cnpjFormatado = `${cnpjDigits.slice(0,2)}.${cnpjDigits.slice(2,5)}.${cnpjDigits.slice(5,8)}/${cnpjDigits.slice(8,12)}-${cnpjDigits.slice(12)}`;

  const { data: regs, error: findErr } = await supabase
    .from("client_registrations")
    .select("id, cnpj, pgfn_consulted, conversation_id")
    .or(`cnpj.eq.${cnpjDigits},cnpj.eq.${cnpjFormatado}`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (findErr) {
    return new Response(JSON.stringify({ error: findErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!regs || regs.length === 0) {
    // Registro ainda não criado (pode ser race condition — Chatwoot demora a criar)
    // Retorna 404 mas o bot pode ignorar; o worker vai pegar pelo polling normal
    return new Response(JSON.stringify({ ok: false, reason: "registro não encontrado" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const reg = regs[0];

  // Monta o update
  const updateData: Record<string, any> = {
    conversation_id: String(conversation_id),
  };

  // Se já foi marcado como consultado, reseta para o worker processar novamente
  // (só reseta se não houver screenshot já salvo — evita reprocessamento desnecessário)
  const { count: screenshotCount } = await supabase
    .from("client_registration_automation_files")
    .select("id", { count: "exact", head: true })
    .eq("registration_id", reg.id)
    .eq("file_type", "pgfn_screenshot");

  const jaTemScreenshot = (screenshotCount ?? 0) > 0;

  if (!jaTemScreenshot) {
    // Ainda não tem screenshot — garante que o worker vai processar
    updateData.pgfn_consulted = false;
  }

  const { error: updateErr } = await supabase
    .from("client_registrations")
    .update(updateData)
    .eq("id", reg.id);

  if (updateErr) {
    return new Response(JSON.stringify({ error: updateErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    ok: true,
    registration_id: reg.id,
    conversation_id_vinculado: String(conversation_id),
    ja_tinha_screenshot: jaTemScreenshot,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
