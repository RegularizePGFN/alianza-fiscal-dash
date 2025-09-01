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
  console.log(`🔧 API URL: ${apiUrl}, API Key: ${apiKey ? 'Present' : 'Missing'}`);
  
  // Tentar diferentes endpoints para obter contatos
  const endpoints = [
    `/chat/findChats/${instanceId}?limit=50`,
    `/chat/findContacts/${instanceId}`,
    `/message/findMany/${instanceId}?limit=50&where[key]=remoteJid`
  ];
  
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  for (const endpoint of endpoints) {
    try {
      const url = `${normalizedApiUrl}${endpoint}`;
      console.log(`📡 Trying endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
      });

      console.log(`📡 Response status for ${endpoint}: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📋 Found ${data?.length || 0} items from ${endpoint}`);
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Processar dados baseado no endpoint
          if (endpoint.includes('findChats')) {
            return data
              .filter(chat => chat.id && !chat.id.includes('@g.us')) // Filtrar grupos
              .map(chat => ({
                id: chat.id,
                name: chat.name || chat.pushName || chat.id.split('@')[0],
                pushName: chat.pushName,
                profilePicUrl: chat.profilePicUrl,
                remoteJid: chat.id,
              }))
              .slice(0, 50);
          } else if (endpoint.includes('findContacts')) {
            return data
              .filter(contact => contact.remoteJid && !contact.remoteJid.includes('@g.us'))
              .slice(0, 50);
          } else if (endpoint.includes('findMany')) {
            // Extrair contatos únicos das mensagens
            const uniqueContacts = new Map();
            data.forEach(msg => {
              if (msg.key?.remoteJid && !msg.key.remoteJid.includes('@g.us')) {
                const jid = msg.key.remoteJid;
                if (!uniqueContacts.has(jid)) {
                  uniqueContacts.set(jid, {
                    id: jid,
                    name: msg.pushName || jid.split('@')[0],
                    pushName: msg.pushName,
                    profilePicUrl: null,
                    remoteJid: jid,
                  });
                }
              }
            });
            return Array.from(uniqueContacts.values()).slice(0, 50);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error with endpoint ${endpoint}:`, error);
      continue;
    }
  }
  
  console.log(`❌ All endpoints failed for instance ${instanceId}`);
  return [];
}

async function fetchRecentChats(
  apiUrl: string,
  apiKey: string,
  instanceId: string
): Promise<Contact[]> {
  console.log(`🔍 This function is now integrated into fetchInstanceContacts`);
  return [];
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