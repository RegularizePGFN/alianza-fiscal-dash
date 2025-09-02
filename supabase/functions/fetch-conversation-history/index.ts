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
    const { contact_phone, instance_name } = await req.json();

    if (!contact_phone || !instance_name) {
      throw new Error('contact_phone and instance_name are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user authentication token from request
    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authToken) {
      throw new Error('Authentication required');
    }

    // Set auth for Supabase client
    await supabase.auth.setAuth(authToken);

    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log(`🔄 Fetching conversation history for contact ${contact_phone} on instance ${instance_name}`);

    // Get Evolution API credentials for the instance
    const { data: instanceData, error: instanceError } = await supabase
      .from('user_whatsapp_instances')
      .select('evolution_api_url, evolution_api_key, evolution_instance_id')
      .eq('instance_name', instance_name)
      .eq('user_id', user.id)
      .single();

    if (instanceError || !instanceData) {
      throw new Error('Instance not found or not authorized');
    }

    const { evolution_api_url, evolution_api_key, evolution_instance_id } = instanceData;

    if (!evolution_api_url || !evolution_api_key || !evolution_instance_id) {
      throw new Error('Instance not properly configured');
    }

    // Format phone number for Evolution API (remove special characters and ensure it starts with country code)
    const formattedPhone = contact_phone.replace(/\D/g, '');
    const remoteJid = formattedPhone.includes('@') ? formattedPhone : `${formattedPhone}@s.whatsapp.net`;

    console.log(`📱 Formatted contact: ${remoteJid}`);

    // Fetch conversation history from Evolution API
    const evolutionUrl = `${evolution_api_url}/chat/findMessages/${evolution_instance_id}`;
    
    const evolutionResponse = await fetch(evolutionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolution_api_key,
      },
      body: JSON.stringify({
        where: {
          key: {
            remoteJid: remoteJid
          }
        },
        limit: 4
      })
    });

    if (!evolutionResponse.ok) {
      const errorText = await evolutionResponse.text();
      console.error('❌ Evolution API error:', errorText);
      throw new Error(`Evolution API error: ${evolutionResponse.status}`);
    }

    const evolutionData = await evolutionResponse.json();
    console.log(`📋 Evolution API response:`, JSON.stringify(evolutionData, null, 2));

    let messages = [];
    
    if (evolutionData && evolutionData.length > 0) {
      messages = evolutionData
        .slice(0, 4) // Get last 4 messages
        .map((msg: any) => {
          const isFromMe = msg.key?.fromMe || false;
          const messageText = msg.message?.conversation || 
                            msg.message?.extendedTextMessage?.text || 
                            msg.message?.imageMessage?.caption ||
                            msg.message?.documentMessage?.title ||
                            '[Mídia]';
          
          return {
            id: msg.key?.id,
            text: messageText,
            type: isFromMe ? 'sent' : 'received',
            timestamp: msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toISOString() : new Date().toISOString(),
            whatsapp_message_id: msg.key?.id
          };
        })
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Store messages in conversation_history table
      for (const message of messages) {
        try {
          const { error: insertError } = await supabase
            .from('conversation_history')
            .upsert({
              contact_phone,
              instance_name,
              message_text: message.text,
              message_type: message.type,
              message_timestamp: message.timestamp,
              whatsapp_message_id: message.whatsapp_message_id
            }, {
              onConflict: 'whatsapp_message_id',
              ignoreDuplicates: true
            });

          if (insertError) {
            console.error('❌ Error storing message:', insertError);
          }
        } catch (storeError) {
          console.error('❌ Error storing message:', storeError);
        }
      }

      console.log(`✅ Found and stored ${messages.length} messages`);
    } else {
      console.log('📭 No messages found for this contact');
    }

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
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});