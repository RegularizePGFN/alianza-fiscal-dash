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

  const { data: regs, error } = await supabase
    .from("client_registrations")
    .select("id, client_name, cnpj, cpf, pgfn_consulted, updated_at, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ids = (regs ?? []).map((r: any) => r.id);
  const screenshotIds = new Set<string>();

  if (ids.length > 0) {
    const pageSize = 1000;
    let from = 0;
    while (true) {
      const { data, error: sErr } = await supabase
        .from("client_registration_automation_files")
        .select("registration_id")
        .eq("file_type", "pgfn_screenshot")
        .in("registration_id", ids)
        .range(from, from + pageSize - 1);
      if (sErr) {
        return new Response(JSON.stringify({ error: sErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!data || data.length === 0) break;
      for (const r of data) if (r.registration_id) screenshotIds.add(r.registration_id);
      if (data.length < pageSize) break;
      from += pageSize;
    }
  }

  const registrations = (regs ?? []).map((r: any) => {
    const has_screenshot = screenshotIds.has(r.id);
    let pgfn_status: string | null = null;
    if (r.pgfn_consulted === true) {
      pgfn_status = has_screenshot ? "consultado" : "sem_screenshot";
    }
    return {
      id: r.id,
      nome: r.client_name,
      cnpj: r.cnpj,
      cpf_encontrado: r.cpf ?? null,
      pgfn_status,
      pgfn_updated_at: r.updated_at ?? null,
      has_screenshot,
    };
  });

  return new Response(JSON.stringify({ registrations }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
