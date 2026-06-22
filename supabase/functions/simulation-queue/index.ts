import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key, content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. IDs que já têm screenshot de simulação
  const { data: existingFiles, error: filesErr } = await supabase
    .from("client_registration_automation_files")
    .select("registration_id")
    .in("file_type", ["screenshot", "pgfn_screenshot"]);


  if (filesErr) {
    return new Response(JSON.stringify({ error: filesErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const excludeIds = Array.from(new Set((existingFiles ?? []).map((f: any) => f.registration_id).filter(Boolean)));

  // 2. Busca candidatos:
  // Inclui explicitamente NULL, 'pending' e 'sim_error' (retry de falhas)
  // Exclui: sim_processing, confirmed_no_debts, success
  let query = supabase
    .from("client_registrations")
    .select("id, cnpj")
    .eq("status", "realizado")
    .or("simulation_status.is.null,simulation_status.eq.pending,simulation_status.eq.sim_error")
    .not("cnpj", "is", null)
    .neq("cnpj", "")
    .order("created_at", { ascending: false })
    .limit(5);


  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const jobs = (data ?? []).map((r: any) => ({ id: r.id, cnpj: r.cnpj }));

  if (jobs.length > 0) {
    const ids = jobs.map((j) => j.id);
    await supabase
      .from("client_registrations")
      .update({ simulation_status: "sim_processing" })
      .in("id", ids);
  }

  return new Response(JSON.stringify({ jobs }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
