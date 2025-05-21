
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
    // Using a JavaScript object with a function property instead of a raw function string
    const payload = {
      code: `
        async function run(context) {
          try {
            const { page } = context;
            
            // Set viewport to A4 size at higher DPI for better quality
            await page.setViewport({
              width: 1240, // A4 width at higher DPI (roughly 1.5x standard 794px)
              height: 1754, // A4 height at higher DPI (roughly 1.5x standard 1123px)
              deviceScaleFactor: 2
            });
            
            // Wait for fonts and images to load completely
            await page.evaluate(async () => {
              await document.fonts.ready;
              const imgPromises = Array.from(document.querySelectorAll('img'))
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                  img.onload = img.onerror = resolve;
                }));
              await Promise.all(imgPromises);
              console.log('All fonts and images loaded');
              return true;
            });
            
            // Additional wait time to ensure everything renders properly
            await page.waitForTimeout(2000);
            
            // For PDF generation
            if ('${format}' === 'pdf') {
              const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                  top: '10mm',
                  right: '10mm',
                  bottom: '10mm',
                  left: '10mm',
                },
                preferCSSPageSize: true
              });
              return pdf.toString('base64');
            } 
            // For PNG generation
            else {
              const screenshot = await page.screenshot({
                type: 'png',
                fullPage: true,
                omitBackground: false
              });
              return screenshot.toString('base64');
            }
          } catch (error) {
            console.error('Puppeteer error:', error);
            throw new Error('Failed to render: ' + error.message);
          }
        }

        module.exports = run;
      `,
      context: {
        html: html,
        stealth: true, // Better compatibility
        flags: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
        defaultViewport: {
          width: 1240, // A4 width at higher DPI
          height: 1754, // A4 height at higher DPI
          deviceScaleFactor: 2
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        timeout: 30000, // 30 seconds, increased timeout
      }
    };
    
    console.log('Sending request to Browserless with improved configuration...');
    
    // Call Browserless.io API with the properly formatted function
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(payload),
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
      if (result && result.data) {
        console.log('Received successful response with data');
      } else {
        console.error('Received response but no data field:', JSON.stringify(result).substring(0, 200));
      }
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
