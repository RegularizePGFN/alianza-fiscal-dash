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

  // Busca registros com CNPJ mas ainda não consultados na PGFN
  const { data, error } = await supabase
    .from("client_registrations")
    .select("id, cnpj, client_name, conversation_id")
    .not("cnpj", "is", null)
    .neq("cnpj", "")
    .or("pgfn_consulted.is.null,pgfn_consulted.eq.false")
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Marca como "em consulta" para evitar duplicação
  if (data && data.length > 0) {
    const ids = data.map((r: any) => r.id);
    await supabase
      .from("client_registrations")
      .update({ pgfn_consulted: true })
      .in("id", ids);
    // Nota: será atualizado de forma definitiva pelo pgfn-result
  }

  return new Response(JSON.stringify({ items: data ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
