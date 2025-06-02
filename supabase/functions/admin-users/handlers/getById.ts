
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../utils/cors.ts';
import { isValidUUID } from '../utils/validation.ts';

export async function handleGetUserById(userId: string): Promise<Response> {
  console.log('Extracted userId for get:', userId);
  
  // Validate UUID format
  if (!isValidUUID(userId)) {
    console.error('Invalid UUID format for get:', userId);
    throw new Error('Invalid user ID format');
  }

  console.log('Getting user by ID:', userId);

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    console.error('Error getting user:', error);
    throw error;
  }

  return new Response(JSON.stringify({ data: { user: data.user }, error: null }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
