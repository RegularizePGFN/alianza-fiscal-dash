import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-api-key, content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

  // Validadores
  const onlyDigits = (s: string | null) => (s ?? "").replace(/\D/g, "");
  const isValidCPF = (raw: string | null) => {
    const c = onlyDigits(raw);
    if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    let s = 0;
    for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
    let d = 11 - (s % 11); if (d >= 10) d = 0;
    if (d !== parseInt(c[9])) return false;
    s = 0;
    for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
    d = 11 - (s % 11); if (d >= 10) d = 0;
    return d === parseInt(c[10]);
  };
  const isValidCNPJ = (raw: string | null) => {
    const c = onlyDigits(raw);
    if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
    const calc = (len: number) => {
      const w = len === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
      let s = 0;
      for (let i = 0; i < len; i++) s += parseInt(c[i]) * w[i];
      const r = s % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return calc(12) === parseInt(c[12]) && calc(13) === parseInt(c[13]);
  };

  // Pega todos pending aguardando pra classificar
  const { data: candidates, error: candErr } = await supabase
    .from("client_registrations")
    .select("id, cpf, cnpj, client_name, client_phone, reason, salesperson_id, salesperson_name, created_at, automation_attempts")
    .eq("automation_status", "pending")
    .eq("status", "aguardando")
    .order("created_at", { ascending: true })
    .limit(200);
  if (candErr) {
    return new Response(JSON.stringify({ error: candErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const incompletos: string[] = [];
  const invalidos: string[] = [];
  const validos: any[] = [];
  for (const r of (candidates ?? [])) {
    if (!r.cpf || !r.cnpj) { incompletos.push(r.id); continue; }
    if (!isValidCPF(r.cpf) || !isValidCNPJ(r.cnpj)) { invalidos.push(r.id); continue; }
    validos.push(r);
  }

  if (incompletos.length) {
    await supabase.from("client_registrations").update({
      automation_status: "dados_incompletos",
      automation_finished_at: new Date().toISOString(),
    }).in("id", incompletos);
  }
  if (invalidos.length) {
    await supabase.from("client_registrations").update({
      automation_status: "dados_invalidos",
      automation_finished_at: new Date().toISOString(),
    }).in("id", invalidos);
  }

  const items = validos.slice(0, 50);
  if (items.length === 0) {
    return new Response(JSON.stringify({ items: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ids = items.map((i: any) => i.id);
  const { error: updErr } = await supabase
    .from("client_registrations")
    .update({
      automation_status: "processing",
      automation_started_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("automation_status", "pending");
  if (updErr) {
    return new Response(JSON.stringify({ error: updErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Increment attempts (separate to avoid race)
  for (const it of items) {
    await supabase
      .from("client_registrations")
      .update({ automation_attempts: (it.automation_attempts ?? 0) + 1 })
      .eq("id", it.id);
  }

  // Buscar email do vendedor
  const spIds = Array.from(new Set(items.map((i: any) => i.salesperson_id).filter(Boolean)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", spIds);
  const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const result = items.map((i: any) => ({
    id: i.id,
    cpf: i.cpf,
    cnpj: i.cnpj,
    client_name: i.client_name,
    client_phone: i.client_phone,
    reason: i.reason,
    salesperson: {
      id: i.salesperson_id,
      name: pMap.get(i.salesperson_id)?.name ?? i.salesperson_name,
      email: pMap.get(i.salesperson_id)?.email ?? null,
    },
    created_at: i.created_at,
    attempts: (i.automation_attempts ?? 0) + 1,
  }));

  return new Response(JSON.stringify({ items: result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
