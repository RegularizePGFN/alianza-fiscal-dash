
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

    // Simplify the HTML to reduce complexity
    const simplifiedHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/data-lov-id="[^"]*"/g, ''); // Remove data-lov-id attributes
    
    // Create a proper function string for Browserless - this is KEY!
    // Using a JavaScript object with a function property instead of a raw function string
    const payload = {
      code: `
        async function run(context) {
          try {
            console.log("Starting rendering in Browserless");
            const { page } = context;
            
            // Set viewport to A4 size at higher DPI for better quality
            await page.setViewport({
              width: 1240, // A4 width at higher DPI (roughly 1.5x standard 794px)
              height: 1754, // A4 height at higher DPI (roughly 1.5x standard 1123px)
              deviceScaleFactor: 2
            });
            
            console.log("Waiting for fonts and images to load");
            // Wait for fonts and images to load completely
            await page.evaluate(async () => {
              await document.fonts.ready;
              const imgPromises = Array.from(document.querySelectorAll('img'))
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                  img.onload = img.onerror = resolve;
                }));
              await Promise.all(imgPromises);
              return true;
            });
            
            // Additional wait time to ensure everything renders properly
            await page.waitForTimeout(2000);
            
            console.log("All content loaded, preparing to generate ${format}");

            // For PDF generation
            if ('${format}' === 'pdf') {
              try {
                const pdf = await page.pdf({
                  format: 'A4',
                  printBackground: true,
                  preferCSSPageSize: true,
                  margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                  }
                });
                console.log("PDF generation successful");
                return pdf.toString('base64');
              } catch (pdfError) {
                console.error("PDF generation error:", pdfError);
                throw new Error('PDF generation failed: ' + pdfError.message);
              }
            } 
            // For PNG generation
            else {
              try {
                const screenshot = await page.screenshot({
                  type: 'png',
                  fullPage: true,
                  omitBackground: false
                });
                console.log("PNG generation successful");
                return screenshot.toString('base64');
              } catch (pngError) {
                console.error("PNG generation error:", pngError);
                throw new Error('PNG generation failed: ' + pngError.message);
              }
            }
          } catch (error) {
            console.error('Puppeteer error:', error);
            throw new Error('Failed to render: ' + error.message);
          }
        }

        module.exports = run;
      `,
      context: {
        html: simplifiedHtml,
        stealth: true, // Better compatibility
        flags: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
        defaultViewport: {
          width: 1240, // A4 width at higher DPI
          height: 1754, // A4 height at higher DPI
          deviceScaleFactor: 2
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        timeout: 60000, // Increased to 60 seconds for better reliability
      }
    };
    
    console.log('Sending request to Browserless with improved configuration...');
    
    // Add retry logic for Browserless API calls
    let response;
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        // Call Browserless.io API with the properly formatted function
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
    
    // Try to parse response as text first to debug any issues
    const responseText = await response.text();
    console.log('Response text length:', responseText.length);
    console.log('Response preview:', responseText.substring(0, 200) + '...');
    
    let result;
    try {
      // Parse the text as JSON
      result = JSON.parse(responseText);
      
      if (!result || !result.data) {
        console.error('No data in parsed response:', result);
        return new Response(
          JSON.stringify({ 
            error: "No data returned from rendering service", 
            details: result ? JSON.stringify(result).substring(0, 500) : "Empty response" 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError, 'Response text:', responseText.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse rendering service response",
          details: parseError.message
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
