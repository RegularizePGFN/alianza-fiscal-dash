
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Get environment variables
const browserlessUrl = Deno.env.get('BROWSERLESS_URL') || 'https://chrome.browserless.io/function?token=2SLjpxsvtsm7AsIa5bbcb243a24b3d97ee0aee5bc840cb7ed';
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
    
    // Create a proper function string for Browserless - this is KEY!
    // The function must be properly formatted as a string that Browserless can execute
    const renderFunction = `
      async function() {
        try {
          // Wait for fonts and images to load completely
          await document.fonts.ready;
          await new Promise(r => setTimeout(r, 3000));
          
          // Wait for any images to load
          const imgPromises = Array.from(document.querySelectorAll('img'))
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
            }));
          await Promise.all(imgPromises);
          
          ${format === 'pdf' ? `
          // PDF generation with precise A4 settings
          const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
              top: '5mm',
              right: '5mm',
              bottom: '5mm',
              left: '5mm',
            },
            scale: 0.85, // Scale down to ensure fit on one page
            preferCSSPageSize: true
          });
          return pdf.toString('base64');
          ` : `
          // PNG generation with high quality settings
          const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true,
            quality: 100,
            omitBackground: false
          });
          return screenshot.toString('base64');
          `}
        } catch (error) {
          console.error('Error in Browserless function:', error);
          throw new Error('Failed to render: ' + error.message);
        }
      }
    `;
    
    console.log('Sending request to Browserless...');
    
    // Call Browserless.io API with the properly formatted function
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
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123, // A4 height in pixels at 96 DPI
            deviceScaleFactor: 2,
          },
          waitFor: 3000, // Increased wait time to ensure full render
          cookies: [],
          stealth: true, // Use stealth mode for better compatibility
        }
      }),
    });
    
    console.log('Browserless response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Browserless error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: `Browserless API error: ${response.status}`, 
          details: errorText 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let result;
    try {
      result = await response.json();
      console.log('Browserless result type:', typeof result);
      console.log('Browserless result preview:', JSON.stringify(result).substring(0, 200) + '...');
    } catch (error) {
      console.error('Error parsing Browserless response:', error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse Browserless response",
          details: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!result || !result.data) {
      console.error('No data in Browserless response:', result);
      return new Response(
        JSON.stringify({ 
          error: "No data returned from Browserless", 
          details: result 
        }),
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
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
