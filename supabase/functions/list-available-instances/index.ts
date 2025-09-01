import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvolutionInstance {
  name: string; // Nome técnico da instância (PGFN-*)
  connectionStatus: string;
  serverUrl?: string;
  apikey?: string;
  ownerJid?: string;
  profileName?: string;
  profileStatus?: string;
  profilePictureUrl?: string;
  number?: string;
  qrcode?: {
    code?: string;
    base64?: string;
  };
}

async function fetchAvailableInstances(): Promise<EvolutionInstance[]> {
  // Use os valores fixos que foram fornecidos
  const evolutionApiUrl = "https://evoapi.neumocrm.com.br/";
  const evolutionApiKey = "a9e018ea0e146a0a4ecf1dd0233e7ccf";
  
  console.log(`🔍 Fetching available instances from Evolution API`);
  console.log(`🔧 Using URL: ${evolutionApiUrl}`);
  
  // Normalizar a URL removendo barras extras
  const normalizedApiUrl = evolutionApiUrl.endsWith('/') ? evolutionApiUrl.slice(0, -1) : evolutionApiUrl;
  const url = `${normalizedApiUrl}/instance/fetchInstances`;
  
  console.log(`📡 Calling Evolution API: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey,
    },
  });

  console.log(`📡 Evolution API response status: ${response.status}`);
  
  if (!response.ok) {
    console.error(`❌ Evolution API error: ${response.status} ${response.statusText}`);
    const errorText = await response.text();
    console.error(`❌ Error details: ${errorText}`);
    throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`📋 Found ${data.length || 0} instances`);
  console.log(`🔍 Sample instance data:`, JSON.stringify(data[0] || {}, null, 2));
  
  return data || [];
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log(`🔧 Fetching available Evolution API instances`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se o usuário é admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Verificar role do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Access denied: admin role required');
    }

    // Buscar instâncias disponíveis da Evolution API
    const availableInstances = await fetchAvailableInstances();

    // Buscar instâncias já cadastradas no banco
    const { data: existingInstances, error: existingError } = await supabase
      .from('user_whatsapp_instances')
      .select('evolution_instance_id');

    if (existingError) {
      console.error('❌ Error fetching existing instances:', existingError);
    }

    const existingInstanceIds = existingInstances?.map(i => i.evolution_instance_id) || [];

    // Formatar resultados
    const formattedInstances = availableInstances.map(instance => {
      // Extrair número do ownerJid (ex: "553484237790@s.whatsapp.net" -> "553484237790")
      const phoneNumber = instance.ownerJid ? instance.ownerJid.split('@')[0] : 'N/A';
      
      return {
        instanceName: instance.name, // Nome técnico correto (PGFN-*)
        status: instance.connectionStatus,
        profileName: instance.profileName,
        profileStatus: instance.profileStatus,
        owner: instance.ownerJid,
        number: phoneNumber,
        isAlreadyAdded: existingInstanceIds.includes(instance.name), // Usar name também aqui
      };
    });

    console.log(`✅ Returning ${formattedInstances.length} formatted instances`);

    return new Response(
      JSON.stringify({ instances: formattedInstances }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error fetching available instances:', error);
    
    return new Response(
      JSON.stringify({ error: error.message, instances: [] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});