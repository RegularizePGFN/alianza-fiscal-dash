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
  lastMessageTime?: number;
}

function processContacts(data: any[], endpoint: string): Contact[] {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  console.log(`🔍 Processing ${data.length} items from endpoint: ${endpoint}`);
  
  const contacts: Contact[] = [];
  
  // Processar diferentes estruturas de resposta
  for (const item of data) {
    console.log(`📋 Processing item:`, JSON.stringify(item, null, 2));
    
    // Extrair informações do contato
    let jid = item.id || item.remoteJid || item.jid || item.from || item.to;
    let name = item.name || item.pushName || item.notifyName || item.verifiedName;
    let lastMessageTime = item.t || item.timestamp || item.messageTimestamp || item.lastMessageTime;
    
    // Pular grupos do WhatsApp
    if (!jid || jid.includes('@g.us')) {
      console.log(`⏭️ Skipping group or invalid JID: ${jid}`);
      continue;
    }
    
    // Extrair número limpo (antes do @)
    const phoneNumber = jid.split('@')[0];
    
    // Se não tem nome, usar o número
    if (!name || name.trim() === '') {
      name = phoneNumber;
    }
    
    console.log(`✅ Adding contact: ${name} (${phoneNumber}) - JID: ${jid}`);
    
    contacts.push({
      id: jid,
      name: name,
      pushName: item.pushName || name,
      profilePicUrl: item.profilePicUrl || item.picture || null,
      remoteJid: jid,
      lastMessageTime: lastMessageTime
    });
  }
  
  // Ordenar por última mensagem (mais recente primeiro)
  contacts.sort((a, b) => {
    const timeA = a.lastMessageTime || 0;
    const timeB = b.lastMessageTime || 0;
    return timeB - timeA;
  });

  console.log(`🎯 Processed ${contacts.length} valid contacts`);
  return contacts.slice(0, 10); // Limitar a 10 conversas recentes
}

async function fetchInstanceContacts(
  apiUrl: string,
  apiKey: string,
  instanceId: string,
  phoneSearch?: string
): Promise<Contact[]> {
  console.log(`🔍 Fetching contacts for instance: ${instanceId}`);
  console.log(`🔧 API URL: ${apiUrl}, API Key: ${apiKey ? 'Present' : 'Missing'}, Phone Search: ${phoneSearch || 'None'}`);
  
  // Usar endpoints da Evolution API para buscar conversas recentes
  const endpoints = [
    `/chat/findChats/${instanceId}`,
    `/message/findMany/${instanceId}`
  ];
  
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  for (const endpoint of endpoints) {
    try {
      const url = `${normalizedApiUrl}${endpoint}`;
      console.log(`📡 Trying endpoint: ${url}`);
      
      // Configurar método e body baseado no endpoint  
      let method = 'GET';
      let body = null;
      
      if (endpoint.includes('findMany')) {
        method = 'POST';
        if (phoneSearch) {
          body = JSON.stringify({
            where: {
              "key.remoteJid": {
                "contains": phoneSearch
              }
            },
            limit: 10,
            sort: {
              "messageTimestamp": "desc"
            }
          });
        } else {
          body = JSON.stringify({
            limit: 50, // Buscar mais mensagens para extrair conversas únicas
            sort: {
              "messageTimestamp": "desc"
            }
          });
        }
      } else if (endpoint.includes('findChats')) {
        method = 'GET';
        // GET não precisa de body
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

    // Formatar resultados para as últimas 10 conversas
    const formattedContacts = contacts
      .map(contact => {
        // Extrair número limpo (antes do @)
        const phone = contact.remoteJid?.split('@')[0] || '';
        return {
          id: contact.id,
          name: contact.name || phone, // Se não tem nome, usar o número
          phone: phone,
          remoteJid: contact.remoteJid,
          profilePicUrl: contact.profilePicUrl,
        };
      })
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