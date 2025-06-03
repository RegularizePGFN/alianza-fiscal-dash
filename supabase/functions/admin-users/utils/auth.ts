
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function validateAdminUser(authHeader: string) {
  if (!authHeader) {
    console.error('No authorization header provided');
    throw new Error('No authorization header');
  }

  console.log('Validating admin user with auth header...');

  // Create Supabase client for user verification
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const token = authHeader.replace('Bearer ', '');
  console.log('Extracted token length:', token.length);
  
  try {
    // Get user from token with better error handling
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error('Authentication error details:', userError);
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found for token');
      throw new Error('Invalid authentication token - no user found');
    }

    console.log('Authenticated user:', user.email, 'ID:', user.id);

    // Check if user is admin - first check the admin emails list
    const adminEmails = [
      'felipe.souza@socialcriativo.com',
      'gustavo.felipe@aliancafiscal.com',
      'vanessa@aliancafiscal.com',   
      'brenda@aliancafiscal.com'
    ];

    const isAdminByEmail = adminEmails.includes(user.email?.toLowerCase() || '');
    console.log('Is admin by email:', isAdminByEmail, 'for email:', user.email);

    // Also check the profile role using service role key for admin validation
    let isAdminByRole = false;
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      console.log('Checking user role in profiles table...');
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('Profile query error:', profileError);
      } else if (profile) {
        isAdminByRole = profile.role === 'administrador' || profile.role === 'admin';
        console.log('Profile role:', profile.role, 'Is admin by role:', isAdminByRole);
      } else {
        console.log('No profile found for user');
      }
    } catch (err) {
      console.log('Could not fetch profile, will check email only:', err);
    }

    // User is admin if they're in the admin emails list OR have admin role
    const isAdmin = isAdminByEmail || isAdminByRole;
    console.log('Final admin check - Email admin:', isAdminByEmail, 'Role admin:', isAdminByRole, 'Final result:', isAdmin);
    
    if (!isAdmin) {
      console.error('User not authorized - Email:', user.email, 'Admin by email:', isAdminByEmail, 'Admin by role:', isAdminByRole);
      throw new Error('Insufficient permissions - user is not an administrator');
    }

    console.log('User successfully authorized as admin');
    return user;
  } catch (error) {
    console.error('Error in validateAdminUser:', error);
    // Re-throw with more specific error message
    if (error.message.includes('Authentication')) {
      throw error;
    }
    throw new Error(`Admin validation failed: ${error.message}`);
  }
}
