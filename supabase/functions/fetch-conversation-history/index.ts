import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting fetch-conversation-history function');
    
    const requestBody = await req.json();
    console.log('📋 Request body:', JSON.stringify(requestBody));
    
    const { contact_phone, instance_name } = requestBody;

    if (!contact_phone || !instance_name) {
      console.error('❌ Missing required parameters');
      throw new Error('contact_phone and instance_name are required');
    }

    // Get user authentication token from request
    const authToken = req.headers.get('Authorization');
    if (!authToken) {
      console.error('❌ No authorization token provided');
      throw new Error('Authentication required');
    }

    console.log('🔑 Authorization token found');

    // Initialize Supabase client with auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('🌐 Supabase URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Extract user ID from JWT token
    const tokenParts = authToken.replace('Bearer ', '').split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const userId = payload.sub;
    
    console.log('👤 User ID from token:', userId);

    console.log(`🔄 Fetching conversation history for contact ${contact_phone} on instance ${instance_name}`);

    // Get Evolution API credentials for the instance
    const { data: instanceData, error: instanceError } = await supabase
      .from('user_whatsapp_instances')
      .select('evolution_api_url, evolution_api_key, evolution_instance_id')
      .eq('instance_name', instance_name)
      .eq('user_id', userId)
      .single();

    console.log('🔍 Instance query result:', { instanceData, instanceError });

    if (instanceError) {
      console.error('❌ Instance error:', instanceError);
      throw new Error(`Database error: ${instanceError.message}`);
    }
    
    if (!instanceData) {
      console.error('❌ Instance not found');
      throw new Error('Instance not found or not authorized');
    }

    const { evolution_api_url, evolution_api_key, evolution_instance_id } = instanceData;

    if (!evolution_api_url || !evolution_api_key || !evolution_instance_id) {
      console.error('❌ Instance not properly configured:', { 
        hasUrl: !!evolution_api_url, 
        hasKey: !!evolution_api_key, 
        hasInstanceId: !!evolution_instance_id 
      });
      throw new Error('Instance not properly configured');
    }

    console.log('✅ Instance configuration found');

    // Format phone number for Evolution API
    const formattedPhone = contact_phone.replace(/\D/g, '');
    const remoteJid = formattedPhone.includes('@') ? formattedPhone : `${formattedPhone}@s.whatsapp.net`;

    console.log(`📱 Formatted contact: ${remoteJid}`);

    // Create simple response for now to test
    const messages = [
      {
        id: 'test-1',
        text: 'Mensagem de teste 1',
        type: 'received',
        timestamp: new Date().toISOString(),
        whatsapp_message_id: 'test-1'
      },
      {
        id: 'test-2', 
        text: 'Mensagem de teste 2',
        type: 'sent',
        timestamp: new Date().toISOString(),
        whatsapp_message_id: 'test-2'
      }
    ];

    console.log(`✅ Returning ${messages.length} test messages`);

    return new Response(JSON.stringify({ 
      success: true, 
      messages,
      contact_phone,
      instance_name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fetch-conversation-history:', error);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});