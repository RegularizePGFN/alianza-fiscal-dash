
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from './utils/cors.ts';
import { parseUrlPath } from './utils/validation.ts';
import { validateAdminUser } from './utils/auth.ts';
import { handleListUsers } from './handlers/list.ts';
import { handleCreateUser } from './handlers/create.ts';
import { handleUpdateUser } from './handlers/update.ts';
import { handleDeleteUser } from './handlers/delete.ts';
import { handleGetUserById } from './handlers/getById.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  try {
    // Get the authorization header and validate admin user
    const authHeader = req.headers.get('Authorization');
    await validateAdminUser(authHeader);

    const { method } = req;
    const url = new URL(req.url);
    
    // Parse the URL to extract route segments
    const routeSegments = parseUrlPath(url.pathname);

    // Handle different admin operations based on method and path
    if (method === 'GET' && routeSegments.length === 0) {
      // List users - GET /admin-users
      return await handleListUsers();
    }

    if (method === 'POST' && routeSegments.length === 0) {
      // Create user - POST /admin-users
      return await handleCreateUser(req);
    }

    if (method === 'PUT' && routeSegments.length === 1) {
      // Update user - PUT /admin-users/{userId}
      const userId = routeSegments[0];
      return await handleUpdateUser(req, userId);
    }

    if (method === 'DELETE' && routeSegments.length === 1) {
      // Delete user - DELETE /admin-users/{userId}
      const userId = routeSegments[0];
      return await handleDeleteUser(userId);
    }

    if (method === 'GET' && routeSegments.length === 1) {
      // Get user by ID - GET /admin-users/{userId}
      const userId = routeSegments[0];
      return await handleGetUserById(userId);
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
