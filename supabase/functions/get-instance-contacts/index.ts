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
  
  // Tentar buscar mensagens usando chat/findMessages
  try {
    const findMessagesUrl = `${normalizedApiUrl}/chat/findMessages/${instanceId}`;
    console.log(`📡 Trying findMessages endpoint: ${findMessagesUrl}`);
    
    const response = await fetch(findMessagesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        limit: 100,
        sort: {
          messageTimestamp: -1
        }
      })
    });

    console.log(`📡 FindMessages response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📋 Raw findMessages response (first 3 items):`, JSON.stringify(data.slice(0, 3), null, 2));
      
      if (data && Array.isArray(data) && data.length > 0) {
        const uniqueContacts = new Map();
        
        for (const msg of data) {
          const jid = msg.key?.remoteJid || msg.remoteJid;
          if (jid && jid.includes('@s.whatsapp.net') && !jid.includes('@g.us')) {
            const phoneNumber = jid.split('@')[0];
            
            if (phoneSearch && !phoneNumber.includes(phoneSearch)) {
              continue;
            }
            
            if (!uniqueContacts.has(jid)) {
              uniqueContacts.set(jid, {
                id: jid,
                name: msg.pushName || phoneNumber,
                pushName: msg.pushName,
                profilePicUrl: null,
                remoteJid: jid,
                lastMessageTime: msg.messageTimestamp || 0
              });
            }
          }
        }
        
        const contacts = Array.from(uniqueContacts.values())
          .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
          .slice(0, 10);
          
        console.log(`✅ Found ${contacts.length} contacts from findMessages`);
        return contacts;
      }
    }
  } catch (error) {
    console.error(`❌ Error with findMessages endpoint:`, error);
  }

  // Fallback: tentar com chats
  try {
    const chatUrl = `${normalizedApiUrl}/chat/findChats/${instanceId}`;
    console.log(`📡 Trying chat endpoint: ${chatUrl}`);
    
    const response = await fetch(chatUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
    });

    console.log(`📡 Chat response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📋 Raw chat response:`, JSON.stringify(data, null, 2));
      
      if (data && Array.isArray(data) && data.length > 0) {
        const contacts = data
          .filter(chat => {
            const isGroup = chat.id?.includes('@g.us') || chat.isGroup;
            const hasValidId = chat.id && chat.id.includes('@s.whatsapp.net');
            
            if (phoneSearch) {
              const phoneNumber = chat.id?.split('@')[0] || '';
              return !isGroup && hasValidId && phoneNumber.includes(phoneSearch);
            }
            
            return !isGroup && hasValidId;
          })
          .map(chat => {
            const phoneNumber = chat.id.split('@')[0];
            return {
              id: chat.id,
              name: chat.name || chat.pushName || phoneNumber,
              pushName: chat.pushName,
              profilePicUrl: chat.profilePicUrl,
              remoteJid: chat.id,
              lastMessageTime: chat.t || chat.timestamp || 0
            };
          })
          .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
          .slice(0, 10);
          
        console.log(`✅ Found ${contacts.length} valid chats`);
        return contacts;
      }
    }
  } catch (error) {
    console.error(`❌ Error with chat endpoint:`, error);
  }

  console.log(`❌ All endpoints failed for instance ${instanceId}`);
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