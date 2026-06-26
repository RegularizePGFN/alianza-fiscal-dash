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

  // Pega pending (a classificar) e aguardando_cpf (já classificados como pgfn_only pela trigger)
  const { data: candidates, error: candErr } = await supabase
    .from("client_registrations")
    .select("id, cpf, cnpj, client_name, client_phone, mother_name, reason, salesperson_id, salesperson_name, created_at, automation_attempts, automation_status")
    .in("automation_status", ["pending", "aguardando_cpf"])
    .eq("status", "aguardando")
    .eq("processing_mode", "automatico")
    .order("created_at", { ascending: true })
    .limit(200);
  if (candErr) {
    return new Response(JSON.stringify({ error: candErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Classificação:
  // - sem CNPJ → dados_incompletos (nada a fazer)
  // - CNPJ inválido → dados_invalidos
  // - CPF presente mas inválido → dados_invalidos
  // - CNPJ válido + CPF válido → cadastro completo
  // - CNPJ válido + CPF ausente → pgfn_only (automação só consulta PGFN p/ achar CPF + print)
  const incompletos: string[] = [];
  const invalidos: string[] = [];
  const validos: any[] = []; // tem cpf+cnpj válidos
  const pgfnOnly: any[] = []; // só cnpj válido
  for (const r of (candidates ?? [])) {
    if (!r.cnpj) {
      incompletos.push(r.id);
      continue;
    }
    if (!isValidCNPJ(r.cnpj)) {
      invalidos.push(r.id);
      continue;
    }
    if (r.cpf) {
      if (!isValidCPF(r.cpf)) {
        invalidos.push(r.id);
        continue;
      }
      validos.push(r);
    } else {
      pgfnOnly.push(r);
    }
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

  // Combina ambos os tipos (preserva ordem por created_at), respeita limit 50
  const combined = [...validos, ...pgfnOnly]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 50);
  if (combined.length === 0) {
    return new Response(JSON.stringify({ items: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ids = combined.map((i: any) => i.id);
  const pgfnOnlyIds = new Set(pgfnOnly.map((p: any) => p.id));
  const fullIds = ids.filter((id) => !pgfnOnlyIds.has(id));
  const pgfnIds = ids.filter((id) => pgfnOnlyIds.has(id));
  const nowIso = new Date().toISOString();

  if (fullIds.length) {
    const { error: updFullErr } = await supabase
      .from("client_registrations")
      .update({ automation_status: "processing", automation_started_at: nowIso })
      .in("id", fullIds)
      .eq("automation_status", "pending");
    if (updFullErr) {
      return new Response(JSON.stringify({ error: updFullErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (pgfnIds.length) {
    // pgfn_only — só marca started_at; mantém status aguardando_cpf
    // (não vira processing pra ficar visível na UI que está esperando PGFN)
    const { error: updPgfnErr } = await supabase
      .from("client_registrations")
      .update({ automation_started_at: nowIso })
      .in("id", pgfnIds);
    if (updPgfnErr) {
      return new Response(JSON.stringify({ error: updPgfnErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  for (const it of combined) {
    await supabase
      .from("client_registrations")
      .update({ automation_attempts: (it.automation_attempts ?? 0) + 1 })
      .eq("id", it.id);
  }

  const spIds = Array.from(new Set(combined.map((i: any) => i.salesperson_id).filter(Boolean)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", spIds);
  const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  const result = combined.map((i: any) => ({
    id: i.id,
    cpf: i.cpf,
    cnpj: i.cnpj,
    client_name: i.client_name,
    client_phone: i.client_phone,
    mother_name: i.mother_name ?? null,
    reason: i.reason,
    pgfn_only: pgfnOnlyIds.has(i.id),
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
