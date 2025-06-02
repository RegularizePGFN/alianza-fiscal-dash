
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user is authenticated and get their role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
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

    // Also check the profile role
    let isAdminByRole = false;
    try {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
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
      console.error('User not authorized - Email:', user.email, 'Admin by email:', isAdminByEmail, 'Admin by role:', isAdminByRole);
      throw new Error('Insufficient permissions');
    }

    console.log('User authorized as admin');

    const { method } = req;
    const url = new URL(req.url);
    
    // Parse the URL to extract the user ID correctly
    const pathname = url.pathname;
    console.log('Full pathname:', pathname);
    
    // Split the pathname and filter out empty segments
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    console.log('All path segments:', pathSegments);
    
    // Find the index of 'admin-users' and get segments after it
    const adminUsersIndex = pathSegments.findIndex(segment => segment === 'admin-users');
    const routeSegments = adminUsersIndex >= 0 ? pathSegments.slice(adminUsersIndex + 1) : [];
    
    console.log('Route segments after admin-users:', routeSegments);

    // Handle different admin operations based on method and path
    if (method === 'GET' && routeSegments.length === 0) {
      // List users - GET /admin-users
      console.log('Listing users...');
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

    if (method === 'POST' && routeSegments.length === 0) {
      // Create user - POST /admin-users
      const body = await req.json();
      const { email, password, name, role } = body;

      console.log('Creating user:', email);

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

    if (method === 'PUT' && routeSegments.length === 1) {
      // Update user - PUT /admin-users/{userId}
      const userId = routeSegments[0];
      console.log('Extracted userId for update:', userId);
      
      // Validate UUID format
      if (!isValidUUID(userId)) {
        console.error('Invalid UUID format for update:', userId);
        throw new Error('Invalid user ID format');
      }
      
      const body = await req.json();
      const { email, name, role, password } = body;

      console.log('Updating user:', userId, 'with data:', { email, name, role, hasPassword: !!password });

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

    if (method === 'DELETE' && routeSegments.length === 1) {
      // Delete user - DELETE /admin-users/{userId}
      const userId = routeSegments[0];
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

    if (method === 'GET' && routeSegments.length === 1) {
      // Get user by ID - GET /admin-users/{userId}
      const userId = routeSegments[0];
      console.log('Extracted userId for get:', userId);
      
      // Validate UUID format
      if (!isValidUUID(userId)) {
        console.error('Invalid UUID format for get:', userId);
        throw new Error('Invalid user ID format');
      }

      console.log('Getting user by ID:', userId);

      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (error) {
        console.error('Error getting user:', error);
        throw error;
      }

      return new Response(JSON.stringify({ data: { user: data.user }, error: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If we get here, no route matched
    console.error('No route matched - Method:', method, 'Route segments:', routeSegments);
    throw new Error(`Endpoint not found: ${method} ${routeSegments.join('/')}`);

  } catch (error: any) {
    console.error('Admin users function error:', error);
    return new Response(
      JSON.stringify({ 
        data: null, 
        error: { message: error.message || 'Internal server error' }
      }),
      {
        status: error.message?.includes('permissions') ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
