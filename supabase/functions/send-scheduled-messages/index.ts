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
  console.log(`🌐 Calling Evolution API:`, {
    originalApiUrl: apiUrl,
    instanceId,
    phone,
    hasApiKey: !!apiKey,
    messageLength: message.length
  });

  // Normalizar a URL removendo barras extras
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const url = `${normalizedApiUrl}/message/sendText/${instanceId}`;
  
  console.log(`📡 Final URL: ${url}`);
  
  const requestBody = {
    number: phone,
    text: message,
  };
  
  console.log(`📤 Request body:`, requestBody);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  console.log(`📡 Evolution API response status: ${response.status}`);
  
  const responseText = await response.text();
  console.log(`📄 Evolution API response body:`, responseText);

  if (!response.ok) {
    throw new Error(`Evolution API error: ${response.status} ${response.statusText} - ${responseText}`);
  }

  return JSON.parse(responseText);
}

async function processScheduledMessages(userId?: string, userRole?: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  console.log('🔄 Starting scheduled messages processing...', { userId, userRole });

  // Buscar mensagens pendentes que já chegaram na data/hora programada
  const now = new Date().toISOString();
  console.log('⏰ Current time:', now);
  
  let query = supabase
    .from('scheduled_messages')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_date', now);

  // Se não for admin e tiver userId, filtrar apenas mensagens do usuário
  if (userId && userRole !== 'admin') {
    console.log(`🔒 Filtering messages for user ${userId} (role: ${userRole})`);
    query = query.eq('user_id', userId);
  }

  const { data: messages, error: messagesError } = await query;

  if (messagesError) {
    console.error('❌ Error fetching scheduled messages:', messagesError);
    return;
  }

  console.log(`📋 Found ${messages?.length || 0} messages to process`);

  if (!messages || messages.length === 0) {
    console.log('✅ No messages to send');
    return;
  }

  for (const message of messages) {
    console.log(`📞 Processing message ${message.id} for user ${message.user_id}, instance: ${message.instance_name}`);
    
    try {
      // Buscar configurações da instância do usuário
      const { data: userInstance, error: instanceError } = await supabase
        .from('user_whatsapp_instances')
        .select('evolution_instance_id, evolution_api_url, evolution_api_key')
        .eq('user_id', message.user_id)
        .eq('instance_name', message.instance_name)
        .single();

      if (instanceError || !userInstance) {
        console.error(`❌ Instance not found for message ${message.id}:`, instanceError);
        console.log(`🔍 Looking for user_id: ${message.user_id}, instance_name: ${message.instance_name}`);
        
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: 'Instância não encontrada para o usuário',
          })
          .eq('id', message.id);
        continue;
      }

      console.log(`🔧 Found instance config:`, {
        evolution_instance_id: userInstance.evolution_instance_id,
        evolution_api_url: userInstance.evolution_api_url,
        has_api_key: !!userInstance.evolution_api_key
      });

      // Verificar se todos os campos necessários estão preenchidos
      if (!userInstance.evolution_instance_id || !userInstance.evolution_api_url || !userInstance.evolution_api_key) {
        const missingFields = [];
        if (!userInstance.evolution_instance_id) missingFields.push('evolution_instance_id');
        if (!userInstance.evolution_api_url) missingFields.push('evolution_api_url');
        if (!userInstance.evolution_api_key) missingFields.push('evolution_api_key');
        
        console.error(`❌ Missing required fields for instance ${message.instance_name}:`, missingFields);
        
        await supabase
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`,
          })
          .eq('id', message.id);
        continue;
      }

      console.log(`📤 Sending message to ${message.client_phone}...`);

      // Enviar mensagem via Evolution API
      const result = await sendWhatsAppMessage(
        userInstance.evolution_api_url,
        userInstance.evolution_api_key,
        userInstance.evolution_instance_id,
        message.client_phone,
        message.message_text
      );

      console.log(`✅ Message sent successfully for ${message.id}:`, result);

      // Atualizar status para enviado
      await supabase
        .from('scheduled_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      console.log(`✅ Message ${message.id} status updated to 'sent'`);

    } catch (error) {
      console.error(`❌ Error sending message ${message.id}:`, error);
      
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
    // Get user information from the request
    const authHeader = req.headers.get('authorization');
    let userId: string | undefined;
    let userRole: string | undefined;

    if (authHeader) {
      try {
        const supabaseAuth = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );
        
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
        
        if (!userError && user) {
          userId = user.id;
          
          // Fetch user role from profiles using admin client
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          userRole = profile?.role;
          console.log(`👤 Processing request from user ${userId} with role ${userRole}`);
        }
      } catch (error) {
        console.log('❌ Could not authenticate user, processing all messages');
      }
    }

    await processScheduledMessages(userId, userRole);
    
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