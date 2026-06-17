import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const TEST_CNPJ = "45.997.418/0001-53"; // CNPJ válido (Nubank)
const TEST_CONVERSATION_ID = 0;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SECRET = Deno.env.get("CHATWOOT_WEBHOOK_SECRET");

  // Auth do chamador (admin/backoffice)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json(401, { error: "missing_auth" });

  const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) return json(401, { error: "invalid_auth" });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || !["admin", "backoffice"].includes(profile.role)) {
    return json(403, { error: "forbidden" });
  }

  if (!SECRET) {
    return json(500, { error: "missing_secret_env" });
  }

  const tested_at = new Date().toISOString();

  // Limpa qualquer resíduo de testes anteriores para liberar conversation_id=0
  await admin
    .from("client_registrations")
    .delete()
    .eq("conversation_id", TEST_CONVERSATION_ID);

  const testPayload = {
    event: "message_created",
    message_type: "incoming",
    content: `Olá, este é um teste de conexão. CNPJ: ${TEST_CNPJ}`,
    conversation: {
      id: TEST_CONVERSATION_ID,
      meta: {
        sender: { name: "Teste Conexão", phone_number: "+5500000000000" },
        assignee: { name: "Teste" },
      },
    },
    sender: { name: "Teste Conexão", phone_number: "+5500000000000" },
    origem: "teste",
  };

  const targetUrl = `${SUPABASE_URL}/functions/v1/chatwoot-novo-lead`;

  let status = 0;
  let raw: any = null;
  let networkError: string | null = null;
  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`,
        "x-webhook-secret": SECRET,
      },
      body: JSON.stringify(testPayload),
    });
    status = res.status;
    try {
      raw = await res.json();
    } catch {
      raw = { _nonJson: await res.text() };
    }
  } catch (e: any) {
    networkError = String(e?.message ?? e);
  }

  // Camada 1: Auth
  const authOk = status >= 200 && status < 300;
  const authResult = {
    ok: authOk,
    status,
    message: networkError
      ? `Erro de rede: ${networkError}`
      : status === 401
      ? "Secret rejeitado (401)"
      : authOk
      ? "Header e secret aceitos"
      : `HTTP ${status}`,
  };

  // Camada 2: Extração
  const extracted = !!raw?.cadastro_id || (raw?.ok && !raw?.ignorado);
  const extractionResult = {
    ok: !!extracted,
    cnpj_detected: extracted ? TEST_CNPJ.replace(/\D/g, "") : null,
    message: extracted
      ? "CNPJ reconhecido e validado"
      : raw?.reason === "no_cnpj"
      ? "CNPJ não foi reconhecido pela função"
      : raw?.reason === "event_filtered"
      ? "Evento filtrado antes da extração"
      : "Extração não confirmada",
  };

  // Camada 3: Gravação
  let persistenceOk = false;
  let cadastroId: string | null = raw?.cadastro_id ?? null;
  if (cadastroId) {
    const { data: row } = await admin
      .from("client_registrations")
      .select("id")
      .eq("id", cadastroId)
      .maybeSingle();
    persistenceOk = !!row;
  }
  const persistenceResult = {
    ok: persistenceOk,
    cadastro_id: cadastroId,
    message: persistenceOk
      ? "Linha criada em client_registrations"
      : "Linha não confirmada na tabela",
  };

  // Limpeza obrigatória — apaga o cadastro de teste
  if (cadastroId) {
    await admin.from("client_registrations").delete().eq("id", cadastroId);
  }
  // Reforço — qualquer registro com conversation_id=0
  await admin
    .from("client_registrations")
    .delete()
    .eq("conversation_id", TEST_CONVERSATION_ID);

  const overall = authResult.ok && extractionResult.ok && persistenceResult.ok ? "ok" : "fail";

  return json(200, {
    tested_at,
    auth: authResult,
    extraction: extractionResult,
    persistence: persistenceResult,
    overall,
    raw_response: raw,
  });
});
