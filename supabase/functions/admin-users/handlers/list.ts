
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../utils/cors.ts';

export async function handleListUsers(): Promise<Response> {
  console.log('Listing users...');
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    throw error;
  }

  console.log('Successfully retrieved users:', data.users?.length || 0);

  return new Response(JSON.stringify({ 
    data: { 
      users: data.users || [],
      aud: 'authenticated',
      total_count: data.users?.length || 0
    }, 
    error: null 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
