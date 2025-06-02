
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../utils/cors.ts';

export async function handleCreateUser(req: Request): Promise<Response> {
  const body = await req.json();
  const { email, password, name, role } = body;

  console.log('Creating user:', email);

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role
    },
  });

  if (error) {
    console.error('Error creating user:', error);
    if (error.message?.includes('already exists')) {
      throw new Error('Este e-mail já está cadastrado no sistema');
    }
    throw error;
  }

  console.log('User created successfully:', data.user?.id);

  return new Response(JSON.stringify({ data: { user: data.user }, error: null }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
