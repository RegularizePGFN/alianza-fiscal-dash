import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Contact {
  id: string;
  name: string;
  pushName?: string;
  profilePicUrl?: string;
  remoteJid: string;
}

async function fetchInstanceContacts(
  apiUrl: string,
  apiKey: string,
  instanceId: string
): Promise<Contact[]> {
  console.log(`🔍 Fetching contacts for instance: ${instanceId}`);
  
  // Normalizar a URL removendo barras extras
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const url = `${normalizedApiUrl}/chat/findContacts/${instanceId}`;
  
  console.log(`📡 Calling Evolution API: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    },
  });

  console.log(`📡 Evolution API response status: ${response.status}`);
  
  if (!response.ok) {
    console.error(`❌ Evolution API error: ${response.status} ${response.statusText}`);
    // Se der erro, tentar endpoint alternativo para mensagens recentes
    return await fetchRecentChats(normalizedApiUrl, apiKey, instanceId);
  }

  const data = await response.json();
  console.log(`📋 Found ${data.length || 0} contacts`);
  
  return data || [];
}

async function fetchRecentChats(
  apiUrl: string,
  apiKey: string,
  instanceId: string
): Promise<Contact[]> {
  console.log(`🔍 Trying alternative endpoint for recent chats`);
  
  const url = `${apiUrl}/chat/findChats/${instanceId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    },
  });

  if (!response.ok) {
    console.error(`❌ Alternative endpoint also failed: ${response.status}`);
    return [];
  }

  const chats = await response.json();
  console.log(`📋 Found ${chats.length || 0} recent chats`);
  
  // Converter chats para formato de contatos
  return (chats || []).map((chat: any) => ({
    id: chat.id || chat.remoteJid,
    name: chat.name || chat.pushName || chat.remoteJid?.split('@')[0],
    pushName: chat.pushName,
    profilePicUrl: chat.profilePicUrl,
    remoteJid: chat.remoteJid || chat.id,
  })).filter((contact: Contact) => contact.remoteJid?.includes('@'));
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { instanceName, userId } = await req.json();
    
    if (!instanceName || !userId) {
      throw new Error('Instance name and user ID are required');
    }

    console.log(`🔧 Getting contacts for instance: ${instanceName}, user: ${userId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar configurações da instância
    const { data: instance, error: instanceError } = await supabase
      .from('user_whatsapp_instances')
      .select('evolution_instance_id, evolution_api_url, evolution_api_key')
      .eq('user_id', userId)
      .eq('instance_name', instanceName)
      .eq('is_active', true)
      .single();

    if (instanceError || !instance) {
      throw new Error(`Instance not found or inactive: ${instanceName}`);
    }

    if (!instance.evolution_instance_id || !instance.evolution_api_url || !instance.evolution_api_key) {
      throw new Error('Instance configuration incomplete');
    }

    // Buscar contatos da Evolution API
    const contacts = await fetchInstanceContacts(
      instance.evolution_api_url,
      instance.evolution_api_key,
      instance.evolution_instance_id
    );

    // Limitar e formatar resultados
    const formattedContacts = contacts
      .slice(0, 50) // Limitar a 50 contatos mais recentes
      .map(contact => ({
        id: contact.id,
        name: contact.name || contact.pushName || 'Sem nome',
        phone: contact.remoteJid?.replace('@s.whatsapp.net', '').replace('@g.us', ''),
        remoteJid: contact.remoteJid,
        profilePicUrl: contact.profilePicUrl,
      }))
      .filter(contact => contact.phone && !contact.remoteJid?.includes('@g.us')); // Filtrar grupos

    console.log(`✅ Returning ${formattedContacts.length} formatted contacts`);

    return new Response(
      JSON.stringify({ contacts: formattedContacts }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error getting instance contacts:', error);
    
    return new Response(
      JSON.stringify({ error: error.message, contacts: [] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});