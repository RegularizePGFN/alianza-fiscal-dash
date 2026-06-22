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

function slugify(s: string) {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "categoria";
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

  const { registration_id, simulation_status, screenshot_base64, category } = body;

  if (!registration_id || !simulation_status) {
    return new Response(JSON.stringify({ error: "registration_id e simulation_status são obrigatórios" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const validStatuses = ["success", "confirmed_no_debts", "sim_error"];
  if (!validStatuses.includes(simulation_status)) {
    return new Response(JSON.stringify({ error: "simulation_status inválido" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let screenshotSalvo = false;

  if (simulation_status === "success" && screenshot_base64) {
    try {
      const imageBytes = Uint8Array.from(atob(screenshot_base64), (c) => c.charCodeAt(0));
      const timestamp = Date.now();
      const categorySlug = slugify(category ?? "categoria");
      const filePath = `simulacoes/${registration_id}/${timestamp}_${categorySlug}.png`;
      const fileName = `${timestamp}_${categorySlug}.png`;

      const { error: uploadError } = await supabase.storage
        .from("cadastro-automatico-pdfs")
        .upload(filePath, imageBytes, { contentType: "image/png", upsert: false });

      if (uploadError) {
        console.error("Erro upload screenshot:", uploadError.message);
      } else {
        await supabase
          .from("client_registration_automation_files")
          .insert({
            registration_id,
            file_path: filePath,
            file_name: fileName,
            file_type: "screenshot",
            uploaded_at: new Date().toISOString(),
          });
        screenshotSalvo = true;
      }
    } catch (e) {
      console.error("Erro ao processar screenshot:", e);
    }
  }

  const { error: updateError } = await supabase
    .from("client_registrations")
    .update({ simulation_status })
    .eq("id", registration_id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, screenshot_salvo: screenshotSalvo }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
