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

async function fetchInstanceContacts(
  apiUrl: string,
  apiKey: string,
  instanceId: string,
  phoneSearch?: string
): Promise<Contact[]> {
  console.log(`🔍 Fetching contacts for instance: ${instanceId}`);
  console.log(`🔧 API URL: ${apiUrl}, API Key: ${apiKey ? 'Present' : 'Missing'}, Phone Search: ${phoneSearch || 'None'}`);
  
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  // Método 1: Tentar buscar mensagens sem filtros
  try {
    const findMessagesUrl = `${normalizedApiUrl}/chat/findMessages/${instanceId}`;
    console.log(`📡 Trying findMessages WITHOUT filters: ${findMessagesUrl}`);
    
    const response = await fetch(findMessagesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({})  // Corpo vazio para buscar tudo
    });

    console.log(`📡 FindMessages response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📋 Raw response type:`, typeof data);
      console.log(`📋 Raw response sample:`, JSON.stringify(data, null, 2).substring(0, 1000));
      
      // Extrair contatos de qualquer estrutura possível
      const contacts = extractContactsFromAnyData(data, phoneSearch);
      
      if (contacts.length > 0) {
        console.log(`✅ Found ${contacts.length} contacts from findMessages (no filters)`);
        return contacts;
      }
    }
  } catch (error) {
    console.error(`❌ Error with findMessages (no filters):`, error);
  }

  // Método 2: Tentar com limit
  try {
    const findMessagesUrl = `${normalizedApiUrl}/chat/findMessages/${instanceId}`;
    console.log(`📡 Trying findMessages WITH limit: ${findMessagesUrl}`);
    
    const response = await fetch(findMessagesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({ limit: 50 })
    });

    console.log(`📡 FindMessages (limit) response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📋 Limited response:`, JSON.stringify(data, null, 2).substring(0, 1000));
      
      const contacts = extractContactsFromAnyData(data, phoneSearch);
      
      if (contacts.length > 0) {
        console.log(`✅ Found ${contacts.length} contacts from findMessages (with limit)`);
        return contacts;
      }
    }
  } catch (error) {
    console.error(`❌ Error with findMessages (limit):`, error);
  }

  // Método 3: Tentar findChats
  try {
    const findChatsUrl = `${normalizedApiUrl}/chat/findChats/${instanceId}`;
    console.log(`📡 Trying findChats: ${findChatsUrl}`);
    
    const response = await fetch(findChatsUrl, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    });

    console.log(`📡 FindChats response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📋 Chats response:`, JSON.stringify(data, null, 2).substring(0, 1000));
      
      const contacts = extractContactsFromAnyData(data, phoneSearch);
      
      if (contacts.length > 0) {
        console.log(`✅ Found ${contacts.length} contacts from findChats`);
        return contacts;
      }
    }
  } catch (error) {
    console.error(`❌ Error with findChats:`, error);
  }

  console.log(`❌ All methods failed for instance ${instanceId}`);
  return [];
}

// Função para extrair contatos de qualquer estrutura de dados
function extractContactsFromAnyData(data: any, phoneSearch?: string): Contact[] {
  const contacts: Contact[] = [];
  const uniqueJids = new Set<string>();
  
  function processItem(item: any, source: string) {
    if (!item) return;
    
    // Tentar extrair JID de diferentes campos
    let jid = item.key?.remoteJid || item.remoteJid || item.id || item.jid || item.chatId;
    
    if (jid && typeof jid === 'string' && jid.includes('@') && !uniqueJids.has(jid)) {
      // Filtrar apenas conversas individuais
      if (jid.includes('@s.whatsapp.net')) {
        const phoneNumber = jid.split('@')[0];
        
        // Aplicar filtro de busca se especificado
        if (phoneSearch && !phoneNumber.includes(phoneSearch)) {
          return;
        }
        
        uniqueJids.add(jid);
        
        contacts.push({
          id: jid,
          name: item.pushName || item.name || item.participant || phoneNumber,
          pushName: item.pushName,
          profilePicUrl: item.profilePicUrl || null,
          remoteJid: jid,
          lastMessageTime: item.messageTimestamp || item.timestamp || item.t || Date.now()
        });
        
        console.log(`📞 Found contact: ${phoneNumber} (${item.pushName || 'sem nome'}) from ${source}`);
      }
    }
  }
  
  // Processar diferentes estruturas
  if (Array.isArray(data)) {
    data.forEach((item, index) => processItem(item, `array[${index}]`));
  } else if (data && typeof data === 'object') {
    // Tentar propriedades comuns que podem conter arrays
    const possibleArrays = ['data', 'messages', 'chats', 'contacts', 'results', 'items'];
    
    for (const prop of possibleArrays) {
      if (data[prop] && Array.isArray(data[prop])) {
        data[prop].forEach((item: any, index: number) => processItem(item, `${prop}[${index}]`));
      }
    }
    
    // Se não encontrou arrays, processar o próprio objeto
    if (contacts.length === 0) {
      processItem(data, 'root_object');
    }
  }
  
  // Ordenar por timestamp e retornar os 10 mais recentes
  return contacts
    .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
    .slice(0, 10);
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

    // Formatar resultados
    const formattedContacts = contacts.map(contact => {
      const phone = contact.remoteJid?.split('@')[0] || '';
      return {
        id: contact.id,
        name: contact.name || phone,
        phone: phone,
        remoteJid: contact.remoteJid,
        profilePicUrl: contact.profilePicUrl,
      };
    });

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