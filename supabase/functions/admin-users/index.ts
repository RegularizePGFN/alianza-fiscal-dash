
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      throw new Error('Invalid authentication token');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'administrador') {
      throw new Error('Insufficient permissions');
    }

    const { method } = req;
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // Handle different admin operations
    if (method === 'GET' && pathSegments.length === 2) {
      // List users
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }

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

    if (method === 'POST' && pathSegments.length === 2) {
      // Create user
      const body = await req.json();
      const { email, password, name, role } = body;

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
        if (error.message?.includes('already exists')) {
          throw new Error('Este e-mail já está cadastrado no sistema');
        }
        throw error;
      }

      return new Response(JSON.stringify({ data: { user: data.user }, error: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'PUT' && pathSegments.length === 3) {
      // Update user
      const userId = pathSegments[2];
      const body = await req.json();
      const { email, name, role, password } = body;

      // Update auth user
      const updateData: any = {
        email,
        user_metadata: { name, role }
      };

      if (password) {
        updateData.password = password;
      }

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);

      if (error) {
        throw error;
      }

      // Update profile
      await supabaseAdmin
        .from('profiles')
        .update({ name, email, role })
        .eq('id', userId);

      return new Response(JSON.stringify({ data: { user: data.user }, error: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE' && pathSegments.length === 3) {
      // Delete user
      const userId = pathSegments[2];

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ data: { user: null }, error: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'GET' && pathSegments.length === 3) {
      // Get user by ID
      const userId = pathSegments[2];

      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ data: { user: data.user }, error: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid endpoint');

  } catch (error: any) {
    console.error('Admin users function error:', error);
    return new Response(
      JSON.stringify({ 
        data: { user: null }, 
        error: { message: error.message || 'Internal server error' }
      }),
      {
        status: error.message?.includes('permissions') ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
