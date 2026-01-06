
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function validateAdminUser(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Create Supabase client with the user's auth token
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  // Validate the JWT and get claims
  const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
  
  if (claimsError || !claimsData?.claims) {
    console.error('Authentication error:', claimsError);
    throw new Error('Invalid authentication token');
  }

  const userId = claimsData.claims.sub;
  const userEmail = claimsData.claims.email as string;
  
  console.log('Authenticated user:', userEmail);

  // Check if user is admin - first check the admin emails list
  const adminEmails = [
    'felipe.souza@socialcriativo.com',
    'gustavo.felipe@aliancafiscal.com',
    'vanessa@aliancafiscal.com',   
    'brenda@aliancafiscal.com'
  ];

  const isAdminByEmail = adminEmails.includes(userEmail?.toLowerCase() || '');
  console.log('Is admin by email:', isAdminByEmail);

  // Also check the profile role
  let isAdminByRole = false;
  try {
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profileError && profile) {
      isAdminByRole = profile.role === 'administrador' || profile.role === 'admin';
      console.log('Profile role:', profile.role, 'Is admin by role:', isAdminByRole);
    }
  } catch (err) {
    console.log('Could not fetch profile, checking email only');
  }

  // User is admin if they're in the admin emails list OR have admin role
  if (!isAdminByEmail && !isAdminByRole) {
    console.error('User not authorized - Email:', userEmail, 'Admin by email:', isAdminByEmail, 'Admin by role:', isAdminByRole);
    throw new Error('Insufficient permissions');
  }

  console.log('User authorized as admin');
  return { id: userId, email: userEmail };
}
