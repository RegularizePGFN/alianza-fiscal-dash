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
  
  // TESTE SIMPLES: Retornar dados mock primeiro para verificar se a função está funcionando
  const mockContacts: Contact[] = [
    {
      id: '5534997088117@s.whatsapp.net',
      name: 'Leandro Poubel (MOCK)',
      phone: '5534997088117',
      remoteJid: '5534997088117@s.whatsapp.net',
      profilePicUrl: null
    },
    {
      id: '5534999999999@s.whatsapp.net', 
      name: 'João Silva (MOCK)',
      phone: '5534999999999',
      remoteJid: '5534999999999@s.whatsapp.net',
      profilePicUrl: null
    },
    {
      id: '5534888888888@s.whatsapp.net', 
      name: 'Maria Santos (MOCK)',
      phone: '5534888888888',
      remoteJid: '5534888888888@s.whatsapp.net',
      profilePicUrl: null
    }
  ];
  
  console.log(`🎯 RETURNING MOCK DATA: ${mockContacts.length} contacts`);
  return mockContacts;
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