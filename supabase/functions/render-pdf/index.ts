
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { S3Client, PutObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3';
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner';

// Configure MinIO client
const minioClient = new S3Client({
  endpoint: 'https://minio.neumo.com.br',
  region: 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('MINIO_ACCESS_KEY') || 'bKUH7zI9pFv7feUTEMlp',
    secretAccessKey: Deno.env.get('MINIO_SECRET_KEY') || '8UQM0yEQz7yMDx2r50zhOCOqFbcToJInX78Sj63g',
  },
  forcePathStyle: true,
});

const MINIO_BUCKET = 'aliancafiscal';

// Configure Browserless client - using public demo key for now
const BROWSERLESS_URL = Deno.env.get('BROWSERLESS_URL') || 'https://chrome.browserless.io/';
const BROWSERLESS_API_KEY = Deno.env.get('BROWSERLESS_API_KEY');

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function createBrowserlessURL(): string {
  const url = new URL('/function', BROWSERLESS_URL);
  if (BROWSERLESS_API_KEY) {
    url.searchParams.append('token', BROWSERLESS_API_KEY);
  }
  return url.toString();
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, format = 'pdf', width = 794, height = 1123, fileName, accessToken } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a unique filename if not provided
    const outputFileName = fileName || `proposal-${Date.now()}.${format}`;
    const minioKey = `proposals/${outputFileName}`;
    
    // Define the Browserless function to execute
    const browserlessFunction = async ({ page }: { page: any }) => {
      await page.setViewport({ width: parseInt(width), height: parseInt(height) });
      
      // If accessToken is provided, set it in localStorage before navigating
      if (accessToken) {
        await page.evaluateOnNewDocument((token) => {
          localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: { access_token: token } }));
        }, accessToken);
      }

      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Hide elements with data-pdf-remove="true" attribute
      await page.evaluate(() => {
        const elementsToHide = document.querySelectorAll('[data-pdf-remove="true"]');
        elementsToHide.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
          }
        });
      });

      // Wait for fonts and images to load
      await page.evaluate(async () => {
        await document.fonts.ready;
        
        const images = Array.from(document.images);
        await Promise.all(
          images
            .filter(img => !img.complete)
            .map(img => new Promise(resolve => {
              img.onload = img.onerror = resolve;
            }))
        );
      });

      // Generate output based on requested format
      let result;
      if (format === 'pdf') {
        result = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
          preferCSSPageSize: true,
        });
      } else {
        // For PNG or JPEG
        result = await page.screenshot({
          fullPage: true,
          type: format === 'png' ? 'png' : 'jpeg',
          quality: format === 'jpeg' ? 90 : undefined,
        });
      }
      
      return result;
    };

    // Call the Browserless service
    const response = await fetch(createBrowserlessURL(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: browserlessFunction.toString(), context: {} })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Browserless error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate file', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the PDF or image data
    const fileData = await response.arrayBuffer();
    
    // Upload to MinIO
    const contentType = format === 'pdf' ? 'application/pdf' : 
                        format === 'png' ? 'image/png' : 'image/jpeg';
    
    const putCommand = new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: minioKey,
      Body: new Uint8Array(fileData),
      ContentType: contentType,
    });

    await minioClient.send(putCommand);
    
    // Generate a signed URL valid for 7 days
    const signedUrl = await getSignedUrl(
      minioClient, 
      {
        Bucket: MINIO_BUCKET,
        Key: minioKey,
      }, 
      { expiresIn: 604800 }
    );

    // Return success response with file URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: signedUrl,
        key: minioKey,
        format,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
