
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Get environment variables
const browserlessUrl = Deno.env.get('BROWSERLESS_URL') || 'https://chrome.browserless.io?token=2SLjpxsvtsm7AsIa5bbcb243a24b3d97ee0aee5bc840cb7ed';
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { html, format = 'png', filename = 'proposta' } = await req.json();
    
    if (!html) {
      return new Response(
        JSON.stringify({ error: "HTML content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Rendering proposal in ${format} format`);
    
    // Create a function to execute in the browser context
    const renderFunction = format === 'pdf' ? 
      // PDF generation function
      `async () => {
        // Wait for fonts and images to load
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 500));
        
        // Generate PDF
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm',
          }
        });
        return pdf.toString('base64');
      }` :
      // PNG generation function
      `async () => {
        // Wait for fonts and images to load
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 500));
        
        // Generate screenshot
        const screenshot = await page.screenshot({
          type: 'png',
          fullPage: true,
          quality: 100
        });
        return screenshot.toString('base64');
      }`;
    
    // Call Browserless.io API
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        code: renderFunction,
        context: {
          html: html,
          viewport: {
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2,
          },
          waitFor: 1000, // Wait 1 second to ensure full render
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Browserless error:', errorText);
      return new Response(
        JSON.stringify({ error: `Browserless API error: ${response.status} ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const result = await response.json();
    
    if (!result.data) {
      return new Response(
        JSON.stringify({ error: "Failed to generate file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return the base64 data
    console.log(`Successfully rendered ${format} file`);
    return new Response(
      JSON.stringify({ 
        data: result.data,
        format: format,
        contentType: format === 'pdf' ? 'application/pdf' : 'image/png',
        filename: `${filename}.${format}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error rendering proposal:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
