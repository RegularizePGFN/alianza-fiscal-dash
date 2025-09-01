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
    const responseText = await response.text();
    console.log(`📋 FindMessages raw response: ${responseText.substring(0, 500)}...`);
    
    if (response.ok && responseText) {
      try {
        const data = JSON.parse(responseText);
        const contacts = extractContactsFromMessages(data, phoneSearch);
        if (contacts.length > 0) {
          console.log(`✅ SUCCESS: Found ${contacts.length} contacts from findMessages`);
          return contacts;
        }
      } catch (parseError) {
        console.error(`❌ JSON parse error:`, parseError);
      }
    }
  } catch (error) {
    console.error(`❌ Error with findMessages:`, error);
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

function extractContactsFromMessages(data: any, phoneSearch?: string): Contact[] {
  console.log(`🔍 Extracting from messages, data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
  
  const contacts: Contact[] = [];
  const uniqueJids = new Set<string>();
  
  const processMessage = (msg: any) => {
    const jid = msg?.key?.remoteJid || msg?.remoteJid || msg?.chatId;
    if (jid && jid.includes('@s.whatsapp.net') && !jid.includes('@g.us')) {
      const phoneNumber = jid.split('@')[0];
      
      if (phoneSearch && !phoneNumber.includes(phoneSearch)) return;
      if (uniqueJids.has(jid)) return;
      
      uniqueJids.add(jid);
      contacts.push({
        id: jid,
        name: msg?.pushName || phoneNumber,
        phone: phoneNumber,
        remoteJid: jid,
        profilePicUrl: msg?.profilePicUrl || null
      });
      
      console.log(`📞 Found: ${phoneNumber} (${msg?.pushName || 'sem nome'})`);
    }
  };
  
  if (Array.isArray(data)) {
    data.forEach(processMessage);
  } else if (data && typeof data === 'object') {
    // Tentar propriedades comuns
    const arrays = ['data', 'messages', 'results'];
    for (const prop of arrays) {
      if (data[prop] && Array.isArray(data[prop])) {
        data[prop].forEach(processMessage);
        break;
      }
    }
  }
  
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
      contacts.push({
        id: jid,
        name: chat?.name || chat?.pushName || phoneNumber,
        phone: phoneNumber,
        remoteJid: jid,
        profilePicUrl: chat?.profilePicUrl || null
      });
      
      console.log(`📞 Found: ${phoneNumber} (${chat?.name || chat?.pushName || 'sem nome'})`);
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