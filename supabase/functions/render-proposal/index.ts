
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Get environment variables
const browserlessBaseUrl = Deno.env.get('BROWSERLESS_URL') || 'https://production-sfo.browserless.io';
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

    // Simplify the HTML to reduce complexity
    const simplifiedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/data-lov-id="[^"]*"/g, ''); // Remove data-lov-id attributes
    
    // Choose the correct endpoint based on format
    const endpoint = format === 'pdf' ? '/pdf' : '/screenshot';
    const browserlessUrl = `${browserlessBaseUrl}${endpoint}`;
    
    if (!browserlessUrl.includes('token=')) {
      console.log('Warning: Browserless URL does not contain a token');
    }
    
    // Prepare the payload based on the format
    let payload;
    
    if (format === 'pdf') {
      payload = {
        html: simplifiedHtml,
        options: {
          printBackground: true,
          format: 'A4',
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
          }
        },
        gotoOptions: {
          waitUntil: 'networkidle2',
          timeout: 30000
        }
      };
    } else { // PNG format
      payload = {
        html: simplifiedHtml,
        options: {
          type: 'png',
          fullPage: true,
          omitBackground: false
        },
        gotoOptions: {
          waitUntil: 'networkidle2',
          timeout: 30000
        },
        viewport: {
          width: 1240, // A4 width at higher DPI
          height: 1754, // A4 height at higher DPI
          deviceScaleFactor: 2
        }
      };
    }
    
    console.log(`Sending request to Browserless endpoint ${endpoint}...`);
    
    // Add retry logic for Browserless API calls
    let response;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        // Call Browserless.io API with the properly formatted payload
        response = await fetch(browserlessUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(payload),
        });
        
        console.log('Browserless response status:', response.status);
        
        if (response.ok) {
          break; // Success, exit retry loop
        } else {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
          console.log(`Attempt ${retries + 1} failed. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        if (retries >= maxRetries) {
          return new Response(
            JSON.stringify({ 
              error: "Failed to connect to rendering service", 
              details: fetchError.message 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        retries++;
      }
    }
    
    if (!response || !response.ok) {
      const errorText = response ? await response.text() : "No response from Browserless";
      console.error('Browserless error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: `Rendering service error: ${response ? response.status : 'No response'}`, 
          details: errorText 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // For PDF endpoint, we get a buffer directly
    if (format === 'pdf') {
      const pdfBuffer = await response.arrayBuffer();
      const pdfBase64 = btoa(
        new Uint8Array(pdfBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      console.log(`Successfully rendered PDF file`);
      return new Response(
        JSON.stringify({ 
          data: pdfBase64,
          format: 'pdf',
          contentType: 'application/pdf',
          filename: `${filename}.pdf`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    // For screenshot endpoint
    else {
      const imageBuffer = await response.arrayBuffer();
      const imageBase64 = btoa(
        new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      console.log(`Successfully rendered PNG file`);
      return new Response(
        JSON.stringify({ 
          data: imageBase64,
          format: 'png',
          contentType: 'image/png',
          filename: `${filename}.png`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
  } catch (error) {
    console.error("Error rendering proposal:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
