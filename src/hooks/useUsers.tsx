
import { useState, useEffect, useRef } from "react";
import { User, UserRole } from "@/lib/types";
import { adminAPI } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapUserRole } from "@/contexts/auth/utils";

export function useUsers() {
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Adicionar uma ref para controlar requisições em andamento
  const isFetchingRef = useRef(false);
  
  // Fetch users using secure admin API
  const fetchUsers = async () => {
    // Evitar chamadas duplicadas
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting fetchUsers...");
      
      // Check if user is authenticated first with better session handling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Erro na sessão: ' + sessionError.message);
      }
      
      if (!session) {
        console.error('No session found');
        throw new Error('Usuário não autenticado - faça login novamente');
      }
      
      if (!session.access_token) {
        console.error('No access token in session');
        throw new Error('Token de acesso inválido - faça login novamente');
      }
      
      console.log("Valid session found, user:", session.user?.email);
      console.log("Access token length:", session.access_token.length);
      
      // Call admin API with proper error handling
      console.log("Calling admin API...");
      const response = await adminAPI.listUsers();
      
      if (response.error) {
        console.error("Admin API error:", response.error);
        
        // Handle specific authentication errors
        if (response.error.message?.includes('authentication') || 
            response.error.message?.includes('Invalid authentication token')) {
          // Try to refresh the session
          console.log("Attempting to refresh session...");
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Session refresh failed:", refreshError);
            throw new Error('Sessão expirada. Faça login novamente.');
          }
          
          if (refreshData.session) {
            console.log("Session refreshed, retrying admin API call...");
            // Retry the admin API call with new session
            const retryResponse = await adminAPI.listUsers();
            
            if (retryResponse.error) {
              throw new Error(retryResponse.error.message || 'Erro ao buscar usuários após refresh');
            }
            
            // Continue with the retry response
            if (!retryResponse.data?.users) {
              setUsers([]);
              return;
            }
            
            // Process the retry response data
            await processUsersData(retryResponse.data.users);
            return;
          }
        }
        
        throw new Error(response.error.message || 'Erro ao buscar usuários');
      }
      
      console.log("Admin API response received:", response.data);
      
      if (!response.data?.users || response.data.users.length === 0) {
        console.log("No users found in response");
        setUsers([]);
        return;
      }

      await processUsersData(response.data.users);
      
    } catch (err: any) {
      console.error("Error in fetchUsers:", err);
      const errorMessage = err.message || "Falha ao carregar os usuários.";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Helper function to process users data
  const processUsersData = async (authUsers: any[]) => {
    try {
      // Fetch profile data for all users
      console.log("Fetching profile data for", authUsers.length, "users...");
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profile data if there's an error
      }

      console.log("Profiles data received:", profilesData?.length || 0, "profiles");
      
      // Convert auth users to our user format, merging with profile data
      const mappedUsers = authUsers.map((authUser: any) => {
        const email = authUser.email || '';
        
        // Find corresponding profile data
        const profile = profilesData?.find(p => p.id === authUser.id);
        
        // Use profile data if available, otherwise fallback to auth metadata
        const name = profile?.name || authUser.user_metadata?.name || email.split('@')[0] || 'Usuário';
        const roleFromProfile = profile?.role;
        const roleFromMetadata = authUser.user_metadata?.role;
        
        // Prioritize profile role, then metadata role
        const role = roleFromProfile || roleFromMetadata || 'vendedor';
        
        // Use the mapUserRole function to convert string role to UserRole enum
        const userRole = mapUserRole(role, email);
        
        console.log(`Mapping user ${name}:`, {
          email,
          profileRole: roleFromProfile,
          metadataRole: roleFromMetadata,
          finalRole: role,
          mappedRole: userRole
        });
        
        return {
          id: authUser.id,
          name: name,
          email: email,
          role: userRole,
          created_at: authUser.created_at,
        };
      });
      
      console.log("Final users list:", mappedUsers.length, "users processed");
      setUsers(mappedUsers);
      
    } catch (error) {
      console.error("Error processing users data:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading, error, fetchUsers };
}
