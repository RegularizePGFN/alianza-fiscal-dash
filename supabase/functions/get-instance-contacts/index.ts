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

function processContacts(data: any[], endpoint: string): Contact[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const contacts: Contact[] = [];
  
  if (endpoint.includes('findChats') || endpoint.includes('chat')) {
    // Processar chats
    for (const item of data) {
      if (item.id && !item.id.includes('@g.us')) {
        contacts.push({
          id: item.id,
          name: item.name || item.pushName || item.id.split('@')[0],
          pushName: item.pushName,
          profilePicUrl: item.profilePicUrl,
          remoteJid: item.id,
        });
      }
    }
  } else if (endpoint.includes('findContacts') || endpoint.includes('contacts')) {
    // Processar contatos
    for (const contact of data) {
      if (contact.remoteJid && !contact.remoteJid.includes('@g.us')) {
        contacts.push({
          id: contact.id || contact.remoteJid,
          name: contact.name || contact.pushName || contact.remoteJid.split('@')[0],
          pushName: contact.pushName,
          profilePicUrl: contact.profilePicUrl,
          remoteJid: contact.remoteJid,
        });
      }
    }
  } else if (endpoint.includes('message') || endpoint.includes('findMany')) {
    // Processar mensagens para extrair contatos únicos
    const uniqueContacts = new Map();
    for (const msg of data) {
      const jid = msg.key?.remoteJid || msg.remoteJid || msg.from || msg.to;
      if (jid && !jid.includes('@g.us') && !uniqueContacts.has(jid)) {
        uniqueContacts.set(jid, {
          id: jid,
          name: msg.pushName || msg.senderName || jid.split('@')[0],
          pushName: msg.pushName,
          profilePicUrl: msg.profilePicUrl || null,
          remoteJid: jid,
        });
      }
    }
    contacts.push(...Array.from(uniqueContacts.values()));
  } else {
    // Tentar processar estrutura genérica
    for (const item of data) {
      const jid = item.id || item.remoteJid || item.jid;
      if (jid && !jid.includes('@g.us')) {
        contacts.push({
          id: jid,
          name: item.name || item.pushName || jid.split('@')[0],
          pushName: item.pushName,
          profilePicUrl: item.profilePicUrl,
          remoteJid: jid,
        });
      }
    }
  }

  return contacts.slice(0, 5); // Limitar a 5 conversas recentes
}

async function fetchInstanceContacts(
  apiUrl: string,
  apiKey: string,
  instanceId: string,
  phoneSearch?: string
): Promise<Contact[]> {
  console.log(`🔍 Fetching contacts for instance: ${instanceId}`);
  console.log(`🔧 API URL: ${apiUrl}, API Key: ${apiKey ? 'Present' : 'Missing'}, Phone Search: ${phoneSearch || 'None'}`);
  
  // Usar endpoints corretos da Evolution API para buscar conversas recentes
  const endpoints = [
    `/chat/findChats/${instanceId}`,
    `/chat/findContacts/${instanceId}`
  ];
  
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  for (const endpoint of endpoints) {
    try {
      const url = `${normalizedApiUrl}${endpoint}`;
      console.log(`📡 Trying endpoint: ${url}`);
      
      // Usar POST para findContacts e GET para findChats
      const method = endpoint.includes('findContacts') ? 'POST' : 'GET';
      let body = null;
      
      if (endpoint.includes('findContacts')) {
        if (phoneSearch) {
          // Se há busca por telefone, usar where com id
          body = JSON.stringify({
            where: {
              id: phoneSearch
            },
            limit: 5
          });
        } else {
          // Buscar conversas recentes sem filtro
          body = JSON.stringify({
            limit: 5,
            where: {}
          });
        }
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        ...(body && { body })
      });

      console.log(`📡 Response status for ${endpoint}: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📋 Raw response data from ${endpoint}:`, JSON.stringify(data, null, 2));
        
        if (data) {
          // Processar diferentes estruturas de resposta
          let processedContacts: Contact[] = [];
          
          if (Array.isArray(data)) {
            // Resposta é um array direto
            processedContacts = processContacts(data, endpoint);
          } else if (data.data && Array.isArray(data.data)) {
            // Resposta está em data.data
            processedContacts = processContacts(data.data, endpoint);
          } else if (data.contacts && Array.isArray(data.contacts)) {
            // Resposta está em data.contacts
            processedContacts = processContacts(data.contacts, endpoint);
          } else if (data.chats && Array.isArray(data.chats)) {
            // Resposta está em data.chats
            processedContacts = processContacts(data.chats, endpoint);
          } else if (data.messages && Array.isArray(data.messages)) {
            // Resposta está em data.messages
            processedContacts = processContacts(data.messages, endpoint);
          }
          
          if (processedContacts.length > 0) {
            console.log(`✅ Successfully processed ${processedContacts.length} contacts from ${endpoint}`);
            return processedContacts;
          }
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Error response from ${endpoint}: ${errorText}`);
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
    const { instanceName, userId, phoneSearch } = await req.json();
    
    if (!instanceName || !userId) {
      throw new Error('Instance name and user ID are required');
    }

    console.log(`🔧 Getting contacts for instance: ${instanceName}, user: ${userId}, phoneSearch: ${phoneSearch || 'none'}`);

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
      instance.evolution_instance_id,
      phoneSearch
    );

    // Limitar e formatar resultados para apenas 5 conversas recentes
    const formattedContacts = contacts
      .slice(0, 5) // Limitar a 5 conversas mais recentes
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