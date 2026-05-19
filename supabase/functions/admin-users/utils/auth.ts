
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function decodeJwtPayload(token: string) {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid authentication token');

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, '=');
  return JSON.parse(atob(padded));
}

export async function validateAdminUser(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const claims = decodeJwtPayload(token);

  if (!claims?.sub || claims.aud !== 'authenticated' || (claims.exp && claims.exp * 1000 <= Date.now())) {
    throw new Error('Invalid authentication token');
  }

  const userId = claims.sub;
  const userEmail = claims.email as string;

  // Create an admin client for authorization checks. The Edge Function gateway
  // already verifies the JWT signature before this function runs.
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

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
    const { data: profile, error: profileError } = await supabaseAdmin
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
