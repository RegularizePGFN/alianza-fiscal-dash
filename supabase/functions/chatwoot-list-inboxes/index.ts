import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const CHATWOOT_BASE_URL = "https://chatwoot.neumocrm.com.br";
const CHATWOOT_ACCOUNT_ID = 1;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const API_TOKEN = Deno.env.get("CHATWOOT_API_TOKEN");

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

  if (!profile || profile.role !== "admin") {
    return json(403, { error: "forbidden" });
  }

  if (!API_TOKEN) return json(500, { error: "missing_chatwoot_api_token" });

  const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/inboxes`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "api_access_token": API_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return json(200, {
        error: "chatwoot_upstream_error",
        status: res.status,
        message: res.status === 401
          ? "Token do Chatwoot inválido ou sem permissão"
          : `Chatwoot retornou HTTP ${res.status}`,
        body: text.slice(0, 500),
      });
    }

    const data = await res.json();
    const payload = Array.isArray(data?.payload) ? data.payload : Array.isArray(data) ? data : [];

    const inboxes = payload.map((ib: any) => ({
      id: ib.id,
      name: ib.name,
      channel_type: ib.channel_type,
      provider: ib.provider ?? null,
      phone_number: ib.phone_number ?? null,
    }));

    return json(200, { inboxes });
  } catch (e: any) {
    return json(200, {
      error: "network_error",
      message: String(e?.message ?? e),
    });
  }
});
