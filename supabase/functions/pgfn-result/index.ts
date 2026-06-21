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

  const body = await req.json();
  const { registration_id, cpf_encontrado, screenshot_base64, encontrou_divida } = body;

  if (!registration_id) {
    return new Response(JSON.stringify({ error: "registration_id obrigatório" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Monta o update em client_registrations
  const updateData: Record<string, any> = {
    pgfn_consulted: true,
  };

  // Atualiza CPF se foi encontrado e o campo ainda está vazio
  if (cpf_encontrado) {
    const { data: reg } = await supabase
      .from("client_registrations")
      .select("cpf")
      .eq("id", registration_id)
      .single();

    const cpfAtual = (reg?.cpf ?? "").replace(/\D/g, "");
    if (!cpfAtual) {
      updateData.cpf = cpf_encontrado;
    }
  }

  const { error: updateError } = await supabase
    .from("client_registrations")
    .update(updateData)
    .eq("id", registration_id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Faz upload do screenshot no Storage e insere registro na tabela automation_files
  let screenshotSalvo = false;
  if (screenshot_base64) {
    try {
      const imageBytes = Uint8Array.from(atob(screenshot_base64), (c) => c.charCodeAt(0));
      const timestamp = Date.now();
      const filePath = `pgfn/${registration_id}/${timestamp}_pgfn_consulta.png`;
      const fileName = `pgfn_consulta_${timestamp}.png`;

      const { error: uploadError } = await supabase.storage
        .from("cadastro-automatico-pdfs")
        .upload(filePath, imageBytes, { contentType: "image/png", upsert: false });

      if (!uploadError) {
        await supabase
          .from("client_registration_automation_files")
          .insert({
            registration_id,
            file_path: filePath,
            file_name: fileName,
            file_type: "pgfn_screenshot",
            uploaded_at: new Date().toISOString(),
          });
        screenshotSalvo = true;
      } else {
        console.error("Erro upload screenshot:", uploadError.message);
      }
    } catch (e) {
      console.error("Erro ao processar screenshot:", e);
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    registration_id,
    cpf_atualizado: !!updateData.cpf,
    screenshot_salvo: screenshotSalvo,
    encontrou_divida,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
