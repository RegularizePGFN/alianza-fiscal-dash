
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../utils/cors.ts';
import { isValidUUID } from '../utils/validation.ts';

export async function handleDeleteUser(userId: string): Promise<Response> {
  console.log('Extracted userId for deletion:', userId);
  console.log('UserId type:', typeof userId);
  console.log('UserId length:', userId.length);

  // Validate UUID format
  if (!isValidUUID(userId)) {
    console.error('Invalid UUID format for deletion:', userId);
    return new Response(JSON.stringify({ 
      data: null, 
      error: { message: 'Invalid user ID format. Must be a valid UUID.' }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('UUID validation passed, proceeding with deletion...');

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Step 1: Delete user from auth.users (this will cascade to profiles via trigger)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      throw new Error(`Failed to delete user from authentication: ${authError.message}`);
    }

    console.log('Auth user deleted successfully');

    // Step 2: Ensure profile is also deleted (backup cleanup)
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.warn('Warning: Could not delete profile (may already be deleted):', profileError);
      } else {
        console.log('Profile deleted successfully');
      }
    } catch (profileErr) {
      console.warn('Warning: Profile deletion failed:', profileErr);
    }

    console.log('User deletion completed successfully:', userId);

    return new Response(JSON.stringify({ 
      data: { user: null }, 
      error: null 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (deleteError: any) {
    console.error('Delete operation failed:', deleteError);
    return new Response(JSON.stringify({ 
      data: null, 
      error: { message: deleteError.message || 'Failed to delete user' }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
