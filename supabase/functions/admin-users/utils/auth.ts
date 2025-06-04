
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
    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.log('User error or no user, trying with service role key...');
      
      // Try with service role key as fallback
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { data: jwtUser, error: jwtError } = await supabaseAdmin.auth.getUser(token);
      
      if (jwtError || !jwtUser) {
        console.error('JWT verification failed:', jwtError);
        throw new Error('Authentication failed - invalid token');
      }
      
      console.log('JWT validated user:', jwtUser.email, 'ID:', jwtUser.id);
      
      // Simple admin check - just check if user exists and has valid session
      const isAdminResult = await checkAdminStatus(jwtUser, supabaseAdmin);
      
      if (!isAdminResult.isAdmin) {
        console.error('User not authorized - Email:', jwtUser.email);
        throw new Error('Insufficient permissions - user is not an administrator');
      }
      
      console.log('User successfully authorized as admin via JWT');
      return jwtUser;
    }

    console.log('Authenticated user:', user.email, 'ID:', user.id);

    // Check if user is admin
    const isAdminResult = await checkAdminStatus(user);
    
    if (!isAdminResult.isAdmin) {
      console.error('User not authorized - Email:', user.email);
      throw new Error('Insufficient permissions - user is not an administrator');
    }

    console.log('User successfully authorized as admin');
    return user;
  } catch (error) {
    console.error('Error in validateAdminUser:', error);
    throw new Error(`Admin validation failed: ${error.message}`);
  }
}

async function checkAdminStatus(user: any, supabaseAdmin?: any) {
  // Check if user is admin - simplified approach
  const adminEmails = [
    'felipe.souza@socialcriativo.com',
    'gustavo.felipe@aliancafiscal.com',
    'vanessa@aliancafiscal.com',   
    'brenda@aliancafiscal.com'
  ];

  const isAdminByEmail = adminEmails.includes(user.email?.toLowerCase() || '');
  console.log('Is admin by email:', isAdminByEmail, 'for email:', user.email);

  // For simplicity, we'll primarily rely on email-based admin check
  // This removes the complex profile queries that were causing issues
  let isAdminByRole = false;
  
  // Only try to check role if we have admin access and it's not causing issues
  if (supabaseAdmin && isAdminByEmail) {
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        isAdminByRole = profile.role === 'administrador' || profile.role === 'admin';
        console.log('Profile role:', profile.role, 'Is admin by role:', isAdminByRole);
      }
    } catch (err) {
      console.log('Could not fetch profile, using email check only:', err);
    }
  }

  // User is admin if they're in the admin emails list OR have admin role
  const isAdmin = isAdminByEmail || isAdminByRole;
  console.log('Final admin check - Email admin:', isAdminByEmail, 'Role admin:', isAdminByRole, 'Final result:', isAdmin);
  
  return {
    isAdmin,
    isAdminByEmail,
    isAdminByRole
  };
}
