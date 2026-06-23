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

  // Paginate to overcome 1000-row limit
  const pageSize = 1000;
  let from = 0;
  const all: any[] = [];
  while (true) {
    const { data, error } = await supabase
      .from("client_registrations")
      .select("id, cnpj, client_name, simulation_status, updated_at")
      .not("cnpj", "is", null)
      .neq("cnpj", "")
      .range(from, from + pageSize - 1);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  // Fetch all screenshot registration_ids
  const screenshotIds = new Set<string>();
  let sFrom = 0;
  while (true) {
    const { data, error } = await supabase
      .from("client_registration_automation_files")
      .select("registration_id")
      .in("file_type", ["screenshot", "pgfn_screenshot"])
      .range(sFrom, sFrom + pageSize - 1);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!data || data.length === 0) break;
    for (const r of data) if (r.registration_id) screenshotIds.add(r.registration_id);
    if (data.length < pageSize) break;
    sFrom += pageSize;
  }

  const registrations = all.map((r) => ({
    id: r.id,
    cnpj: r.cnpj,
    nome: r.client_name,
    simulation_status: r.simulation_status ?? null,
    simulation_updated_at: r.simulation_updated_at ?? null,
    has_screenshots: screenshotIds.has(r.id),
  }));

  // Sort: simulation_updated_at DESC, nulls last
  registrations.sort((a, b) => {
    if (a.simulation_updated_at && b.simulation_updated_at) {
      return b.simulation_updated_at.localeCompare(a.simulation_updated_at);
    }
    if (a.simulation_updated_at) return -1;
    if (b.simulation_updated_at) return 1;
    return 0;
  });

  return new Response(JSON.stringify({ registrations, total: registrations.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
