
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../utils/cors.ts';
import { isValidUUID } from '../utils/validation.ts';

export async function handleUpdateUser(req: Request, userId: string): Promise<Response> {
  console.log('Extracted userId for update:', userId);
  
  // Validate UUID format
  if (!isValidUUID(userId)) {
    console.error('Invalid UUID format for update:', userId);
    throw new Error('Invalid user ID format');
  }
  
  const body = await req.json();
  const { email, name, role, password } = body;

  console.log('Updating user:', userId, 'with data:', { email, name, role, hasPassword: !!password });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Step 1: Update the profile in the database first
    console.log('Step 1: Updating profile in database...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        name: name,
        email: email,
        role: role 
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }
    console.log('Profile updated successfully');

    // Step 2: Update auth user metadata
    console.log('Step 2: Updating auth user metadata...');
    const updateData: any = {
      email,
      user_metadata: { 
        name, 
        role 
      }
    };

    if (password && password.trim()) {
      updateData.password = password;
      console.log('Password will be updated');
    }

    const { data, error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);

    if (authError) {
      console.error('Error updating auth user:', authError);
      throw new Error(`Failed to update user authentication: ${authError.message}`);
    }

    console.log('Auth user updated successfully');
    console.log('User update completed successfully:', userId);

    return new Response(JSON.stringify({ 
      data: { user: data.user }, 
      error: null 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (updateError: any) {
    console.error('Update operation failed:', updateError);
    return new Response(JSON.stringify({ 
      data: null, 
      error: { message: updateError.message || 'Failed to update user' }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
