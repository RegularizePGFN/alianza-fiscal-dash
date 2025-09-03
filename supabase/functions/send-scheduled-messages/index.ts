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

async function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Se não começar com código do país, adiciona 55 (Brasil)
  if (!cleaned.startsWith('55') && cleaned.length >= 10) {
    cleaned = '55' + cleaned;
  }
  
  // Para números brasileiros, garantir que celulares tenham 9 dígitos no meio
  if (cleaned.startsWith('55') && cleaned.length === 12) {
    // Extrair DDD e número
    const ddd = cleaned.substring(2, 4);
    const number = cleaned.substring(4);
    
    // Se o número não começar com 9 e tiver 8 dígitos, adicionar 9
    if (number.length === 8 && !number.startsWith('9')) {
      cleaned = '55' + ddd + '9' + number;
    }
  }
  
  console.log(`📞 Phone formatting: ${phone} -> ${cleaned}`);
  return cleaned;
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

  // Formatar o número de telefone
  const formattedPhone = await formatPhoneNumber(phone);

  // Normalizar a URL removendo barras extras
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const url = `${normalizedApiUrl}/message/sendText/${instanceId}`;
  
  console.log(`📡 Final URL: ${url}`);
  
  const requestBody = {
    number: formattedPhone,
    text: message,
  };
  
  console.log(`📤 Request body:`, requestBody);
  
  try {
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
      let errorDetails = responseText;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.response && errorData.response.message) {
          const errorMessage = errorData.response.message[0];
          if (errorMessage.exists === false) {
            errorDetails = `Número ${formattedPhone} não existe no WhatsApp ou não está válido`;
          } else {
            errorDetails = JSON.stringify(errorData.response.message);
          }
        }
      } catch (parseError) {
        // Se não conseguir fazer parse, mantém o texto original
      }
      
      throw new Error(`Erro da API Evolution (${response.status}): ${errorDetails}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error(`❌ Error sending WhatsApp message:`, error);
    
    // Tratamento de erros mais detalhado
    let errorMessage = 'Erro desconhecido ao enviar mensagem';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Erro de conexão com a API Evolution - Verifique se a URL e as credenciais estão corretas';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
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

  // Reverter mensagens que ainda estão como "processing" de volta para "pending"
  // (caso algo tenha dado errado no processo)
  const { error: revertError } = await supabase
    .from('scheduled_messages')
    .update({ status: 'pending' })
    .eq('status', 'processing')
    .in('id', messageIds);

  if (revertError) {
    console.error('❌ Error reverting processing messages:', revertError);
  } else {
    console.log('🔄 Reverted any remaining processing messages back to pending');
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