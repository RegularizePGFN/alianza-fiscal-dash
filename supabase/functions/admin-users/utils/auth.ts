
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function validateAdminUser(authHeader: string) {
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  // Create Supabase client for user verification
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('Invalid authentication token');
    }

    console.log('Authenticated user:', user.email);

    // Check if user is admin - first check the admin emails list
    const adminEmails = [
      'felipe.souza@socialcriativo.com',
      'gustavo.felipe@aliancafiscal.com',
      'vanessa@aliancafiscal.com',   
      'brenda@aliancafiscal.com'
    ];

    const isAdminByEmail = adminEmails.includes(user.email?.toLowerCase() || '');
    console.log('Is admin by email:', isAdminByEmail);

    // Also check the profile role using service role key for admin validation
    let isAdminByRole = false;
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        isAdminByRole = profile.role === 'administrador' || profile.role === 'admin';
        console.log('Profile role:', profile.role, 'Is admin by role:', isAdminByRole);
      }
    } catch (err) {
      console.log('Could not fetch profile, checking email only:', err);
    }

    // User is admin if they're in the admin emails list OR have admin role
    if (!isAdminByEmail && !isAdminByRole) {
      console.error('User not authorized - Email:', user.email, 'Admin by email:', isAdminByEmail, 'Admin by role:', isAdminByRole);
      throw new Error('Insufficient permissions');
    }

    console.log('User authorized as admin');
    return user;
  } catch (error) {
    console.error('Error validating admin user:', error);
    throw error;
  }
}
