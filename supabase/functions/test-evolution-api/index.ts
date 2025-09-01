import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`🔧 Testing Evolution API direct call`);
    
    const evolutionApiUrl = "https://evoapi.neumocrm.com.br/";
    const evolutionApiKey = "a9e018ea0e146a0a4ecf1dd0233e7ccf";
    
    const normalizedApiUrl = evolutionApiUrl.endsWith('/') ? evolutionApiUrl.slice(0, -1) : evolutionApiUrl;
    const url = `${normalizedApiUrl}/instance/fetchInstances`;
    
    console.log(`📡 Calling Evolution API: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
    });

    console.log(`📡 Evolution API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`❌ Evolution API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`❌ Error details: ${errorText}`);
      throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`📋 Found ${data.length || 0} instances`);
    
    // Log all data for first few instances to see structure
    console.log(`🔍 Full response data:`, JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      console.log(`🔍 First instance detailed:`, JSON.stringify(data[0], null, 2));
      console.log(`🔍 Available keys:`, Object.keys(data[0] || {}));
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        instanceCount: data.length || 0,
        sampleData: data.slice(0, 3), // Return first 3 instances for testing
        firstInstanceKeys: data.length > 0 ? Object.keys(data[0]) : []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error testing Evolution API:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});