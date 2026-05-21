import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "content-disposition",
};

const BodySchema = z.object({
  file_id: z.string().uuid(),
  mode: z.enum(["url", "download"]).optional().default("url"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.replace("Bearer ", "");
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub as string;

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: file } = await admin
    .from("client_registration_automation_files")
    .select("id, file_path, file_name, registration_id")
    .eq("id", parsed.data.file_id)
    .maybeSingle();
  if (!file) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: reg } = await admin
    .from("client_registrations")
    .select("salesperson_id")
    .eq("id", file.registration_id)
    .maybeSingle();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  const role = profile?.role ?? "";
  const isAdminLike = ["admin", "backoffice", "gestor"].includes(role);
  if (!isAdminLike && reg?.salesperson_id !== userId) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (parsed.data.mode === "download") {
    const { data: fileBlob, error: dErr } = await admin.storage
      .from("cadastro-automatico-pdfs")
      .download(file.file_path);

    if (dErr || !fileBlob) {
      return new Response(JSON.stringify({ error: dErr?.message ?? "failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(fileBlob, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.file_name)}"`,
      },
    });
  }

  const { data: signed, error: sErr } = await admin.storage
    .from("cadastro-automatico-pdfs")
    .createSignedUrl(file.file_path, 60 * 60); // 1h
  if (sErr || !signed) {
    return new Response(JSON.stringify({ error: sErr?.message ?? "failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ url: signed.signedUrl, file_name: file.file_name }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
