import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledMessage {
  id: string;
  client_name: string;
  client_phone: string;
  message_text: string;
  scheduled_date: string;
  status: string;
  instance_name: string;
  user_id: string;
}

interface UserInstance {
  evolution_instance_id: string;
  evolution_api_url: string;
  evolution_api_key: string;
}

async function sendWhatsAppMessage(
  apiUrl: string,
  apiKey: string, 
  instanceId: string,
  phone: string,
  message: string
) {
  const url = `${apiUrl}/message/sendText/${instanceId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    },
    body: JSON.stringify({
      number: phone,
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Evolution API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function processScheduledMessages() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Buscar mensagens pendentes que já chegaram na data/hora programada
  const now = new Date().toISOString();
  
  const { data: messages, error: messagesError } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_date', now);

  if (messagesError) {
    console.error('Error fetching scheduled messages:', messagesError);
    return;
  }

  if (!messages || messages.length === 0) {
    console.log('No messages to send');
    return;
  }

  console.log(`Found ${messages.length} messages to send`);

  for (const message of messages) {
    try {
      // Buscar configurações da instância do usuário
      const { data: userInstance, error: instanceError } = await supabase
        .from('user_whatsapp_instances')
        .select('evolution_instance_id, evolution_api_url, evolution_api_key')
        .eq('user_id', message.user_id)
        .eq('instance_name', message.instance_name)
        .single();

      if (instanceError || !userInstance) {
        console.error('Instance not found for message:', message.id);
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: 'Instância não encontrada para o usuário',
          })
          .eq('id', message.id);
        continue;
      }

      // Enviar mensagem via Evolution API
      const result = await sendWhatsAppMessage(
        userInstance.evolution_api_url,
        userInstance.evolution_api_key,
        userInstance.evolution_instance_id,
        message.client_phone,
        message.message_text
      );

      // Atualizar status para enviado
      await supabase
        .from('scheduled_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      console.log(`Message sent successfully: ${message.id}`);

    } catch (error) {
      console.error(`Error sending message ${message.id}:`, error);
      
      // Marcar como falhou
      await supabase
        .from('scheduled_messages')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', message.id);
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    await processScheduledMessages();
    
    return new Response(
      JSON.stringify({ message: 'Scheduled messages processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing scheduled messages:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});