import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Contact {
  id: string;
  name: string;
  phone: string;
  remoteJid: string;
  profilePicUrl?: string;
}

async function fetchInstanceContacts(
  apiUrl: string,
  apiKey: string,
  instanceId: string,
  phoneSearch?: string
): Promise<Contact[]> {
  console.log(`🔍 STARTING fetchInstanceContacts for: ${instanceId}`);
  console.log(`🔧 API URL: ${apiUrl}, API Key: ${apiKey ? 'Present' : 'Missing'}`);
  console.log(`🔍 Phone search filter: ${phoneSearch || 'none'}`);
  
  const normalizedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  
  // Método 1: Tentar findMessages sem filtros
  try {
    const findMessagesUrl = `${normalizedApiUrl}/chat/findMessages/${instanceId}`;
    console.log(`📡 Trying findMessages: ${findMessagesUrl}`);
    
    const response = await fetch(findMessagesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({})
    });

    console.log(`📡 FindMessages status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`❌ FindMessages HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`❌ Error response body: ${errorText.substring(0, 500)}`);
    } else {
      const responseText = await response.text();
      console.log(`📋 FindMessages raw response: ${responseText.substring(0, 500)}...`);
      
      if (responseText) {
        try {
          const data = JSON.parse(responseText);
          console.log(`📊 FindMessages data structure: ${JSON.stringify(Object.keys(data), null, 2)}`);
          
          const contacts = extractContactsFromMessages(data, phoneSearch);
          if (contacts.length > 0) {
            console.log(`✅ SUCCESS: Found ${contacts.length} contacts from findMessages`);
            return contacts;
          } else {
            console.log(`⚠️ No contacts extracted from findMessages for ${instanceId}`);
          }
        } catch (parseError) {
          console.error(`❌ JSON parse error:`, parseError);
          console.error(`❌ Raw response that failed parsing: ${responseText.substring(0, 1000)}`);
        }
      } else {
        console.log(`⚠️ Empty response from findMessages for ${instanceId}`);
      }
    }
  } catch (error) {
    console.error(`❌ Network error with findMessages for ${instanceId}:`, error);
  }
  
  // Método 2: Tentar findChats
  try {
    const findChatsUrl = `${normalizedApiUrl}/chat/findChats/${instanceId}`;
    console.log(`📡 Trying findChats: ${findChatsUrl}`);
    
    const response = await fetch(findChatsUrl, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    });

    console.log(`📡 FindChats status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📋 FindChats raw response: ${responseText.substring(0, 500)}...`);
    
    if (response.ok && responseText) {
      try {
        const data = JSON.parse(responseText);
        const contacts = extractContactsFromChats(data, phoneSearch);
        if (contacts.length > 0) {
          console.log(`✅ SUCCESS: Found ${contacts.length} contacts from findChats`);
          return contacts;
        }
      } catch (parseError) {
        console.log(`❌ JSON parse error:`, parseError);
      }
    }
  } catch (error) {
    console.error(`❌ Error with findChats:`, error);
  }
  
  console.log(`❌ No contacts found from any method`);
  return [];
}

// Função para detectar se o nome é genérico/da instância
function isGenericName(pushName: string, phoneNumber: string): boolean {
  if (!pushName) return true;
  
  // Nomes genéricos comuns
  const genericNames = ['Você', 'You'];
  if (genericNames.includes(pushName)) return true;
  
  // Nomes que contêm padrões de instância
  const instancePatterns = [
    'Brenda - Aliança Fiscal',
    'Felipe Santos',
    'Livia Silva',
    'Lívia Silva',
    'Aliança Fiscal',
    'Santos',
    'Silva'
  ];
  
  return instancePatterns.some(pattern => pushName.includes(pattern));
}

function extractContactsFromMessages(data: any, phoneSearch?: string): Contact[] {
  console.log(`🔍 Extracting from messages, data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
  console.log(`🔍 Data structure:`, JSON.stringify(data, null, 2).substring(0, 1000));
  
  const contacts: Contact[] = [];
  const uniqueJids = new Set<string>();
  
  const processMessage = (msg: any) => {
    console.log(`🔎 Processing message:`, JSON.stringify(msg, null, 2).substring(0, 200));
    
    const jid = msg?.key?.remoteJid || msg?.remoteJid || msg?.chatId;
    if (jid && jid.includes('@s.whatsapp.net') && !jid.includes('@g.us')) {
      const phoneNumber = jid.split('@')[0];
      
      if (phoneSearch && !phoneNumber.includes(phoneSearch)) return;
      if (uniqueJids.has(jid)) return;
      
      uniqueJids.add(jid);
      
      // Usar a função para detectar nomes genéricos
      const contactName = isGenericName(msg?.pushName, phoneNumber)
        ? phoneNumber
        : msg.pushName;
      
      contacts.push({
        id: jid,
        name: contactName,
        phone: phoneNumber,
        remoteJid: jid,
        profilePicUrl: msg?.profilePicUrl || null
      });
      
      console.log(`📞 Found contact: ${phoneNumber} (${msg?.pushName || 'sem nome'})`);
    }
  };
  
  // Verificar se tem a estrutura messages.records
  if (data?.messages?.records && Array.isArray(data.messages.records)) {
    console.log(`📋 Found messages.records with ${data.messages.records.length} items`);
    data.messages.records.slice(0, 50).forEach(processMessage); // Processar apenas os primeiros 50
  } 
  // Verificar outras estruturas possíveis
  else if (Array.isArray(data)) {
    console.log(`📋 Processing array with ${data.length} items`);
    data.slice(0, 50).forEach(processMessage);
  } else if (data && typeof data === 'object') {
    console.log(`📋 Processing object, looking for arrays...`);
    // Tentar propriedades comuns
    const arrays = ['data', 'messages', 'results', 'records'];
    for (const prop of arrays) {
      if (data[prop] && Array.isArray(data[prop])) {
        console.log(`📋 Found array in ${prop} with ${data[prop].length} items`);
        data[prop].slice(0, 50).forEach(processMessage);
        break;
      }
    }
  }
  
  console.log(`📊 Total unique contacts found: ${contacts.length}`);
  return contacts.slice(0, 10);
}

function extractContactsFromChats(data: any, phoneSearch?: string): Contact[] {
  console.log(`🔍 Extracting from chats, data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
  
  const contacts: Contact[] = [];
  const uniqueJids = new Set<string>();
  
  const processChat = (chat: any) => {
    const jid = chat?.id || chat?.jid;
    if (jid && jid.includes('@s.whatsapp.net') && !jid.includes('@g.us')) {
      const phoneNumber = jid.split('@')[0];
      
      if (phoneSearch && !phoneNumber.includes(phoneSearch)) return;
      if (uniqueJids.has(jid)) return;
      
      uniqueJids.add(jid);
      
      // Usar a mesma lógica de detecção de nomes genéricos
      const pushName = chat?.name || chat?.pushName;
      const contactName = isGenericName(pushName, phoneNumber)
        ? phoneNumber
        : pushName || phoneNumber;
      
      contacts.push({
        id: jid,
        name: contactName,
        phone: phoneNumber,
        remoteJid: jid,
        profilePicUrl: chat?.profilePicUrl || null
      });
      
      console.log(`📞 Found: ${phoneNumber} (${pushName || 'sem nome'})`);
    }
  };
  
  if (Array.isArray(data)) {
    data.forEach(processChat);
  } else if (data && typeof data === 'object') {
    // Tentar propriedades comuns
    const arrays = ['data', 'chats', 'results'];
    for (const prop of arrays) {
      if (data[prop] && Array.isArray(data[prop])) {
        data[prop].forEach(processChat);
        break;
      }
    }
  }
  
  return contacts.slice(0, 10);
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

    // Buscar contatos (usando mock por enquanto)
    const contacts = await fetchInstanceContacts(
      instance.evolution_api_url,
      instance.evolution_api_key,
      instance.evolution_instance_id,
      phoneSearch
    );

    console.log(`✅ FINAL RESULT: Returning ${contacts.length} formatted contacts`);
    console.log(`📞 Contacts:`, contacts.map(c => `${c.name} (${c.phone})`).join(', '));

    return new Response(
      JSON.stringify({ contacts }),
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