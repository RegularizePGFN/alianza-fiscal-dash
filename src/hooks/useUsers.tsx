
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
    console.log("👥 [USERS] Starting fetchUsers...");
    
    // Evitar chamadas duplicadas
    if (isFetchingRef.current) {
      console.log("⚠️ [USERS] Fetch already in progress, skipping");
      return;
    }
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🔍 [USERS] Checking user session...");
      
      // Check if user is authenticated first with better session handling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ [USERS] Session error:', sessionError);
        throw new Error('Erro na sessão: ' + sessionError.message);
      }
      
      if (!session?.access_token) {
        console.error('❌ [USERS] No valid session or access token found');
        throw new Error('Usuário não autenticado - faça login novamente');
      }
      
      console.log("✅ [USERS] Valid session found, user:", session.user?.email);
      console.log("🔑 [USERS] Access token length:", session.access_token.length);
      
      // Call admin API with improved error handling
      console.log("📞 [USERS] Calling admin API...");
      const response = await adminAPI.listUsers();
      
      if (response.error) {
        console.error("❌ [USERS] Admin API error:", response.error);
        
        // Handle specific authentication errors with retry logic
        if (response.error.message?.includes('authentication') || 
            response.error.message?.includes('Invalid authentication token') ||
            response.error.message?.includes('Auth session missing')) {
          
          console.log("🔄 [USERS] Authentication error detected, attempting session refresh...");
          
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("❌ [USERS] Session refresh failed:", refreshError);
            throw new Error('Sessão expirada. Faça login novamente.');
          }
          
          if (refreshData.session?.access_token) {
            console.log("✅ [USERS] Session refreshed successfully, retrying admin API call...");
            
            // Wait a bit for the session to be properly set
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry the admin API call with new session
            const retryResponse = await adminAPI.listUsers();
            
            if (retryResponse.error) {
              console.error("❌ [USERS] Retry also failed:", retryResponse.error);
              throw new Error(retryResponse.error.message || 'Erro ao buscar usuários após refresh da sessão');
            }
            
            // Continue with the retry response
            if (!retryResponse.data?.users) {
              console.log("📭 [USERS] No users found in retry response");
              setUsers([]);
              return;
            }
            
            // Process the retry response data
            await processUsersData(retryResponse.data.users);
            return;
          } else {
            throw new Error('Não foi possível renovar a sessão. Faça login novamente.');
          }
        }
        
        throw new Error(response.error.message || 'Erro ao buscar usuários');
      }
      
      console.log("✅ [USERS] Admin API response received:", response.data);
      
      if (!response.data?.users || response.data.users.length === 0) {
        console.log("📭 [USERS] No users found in response");
        setUsers([]);
        return;
      }

      await processUsersData(response.data.users);
      
    } catch (err: any) {
      console.error("💥 [USERS] Error in fetchUsers:", err);
      console.error("💥 [USERS] Error stack:", err.stack);
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
      console.log("🏁 [USERS] fetchUsers completed");
    }
  };

  // Helper function to process users data
  const processUsersData = async (authUsers: any[]) => {
    try {
      console.log("🔄 [USERS] Processing users data for", authUsers.length, "users...");
      
      // Fetch profile data for all users
      console.log("📋 [USERS] Fetching profile data...");
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role');

      if (profilesError) {
        console.error("❌ [USERS] Error fetching profiles:", profilesError);
        // Continue without profile data if there's an error
      } else {
        console.log("✅ [USERS] Profiles data received:", profilesData?.length || 0, "profiles");
      }
      
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
        
        console.log(`👤 [USERS] Mapping user ${name}:`, {
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
      
      console.log("✅ [USERS] Final users list:", mappedUsers.length, "users processed");
      setUsers(mappedUsers);
      
    } catch (error) {
      console.error("💥 [USERS] Error processing users data:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("🚀 [USERS] useUsers hook mounted, starting fetch");
    fetchUsers();
  }, []);

  return { users, isLoading, error, fetchUsers };
}
