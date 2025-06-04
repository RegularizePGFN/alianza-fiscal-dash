
import { useState, useEffect, useRef } from "react";
import { User, UserRole } from "@/lib/types";
import { adminAPI } from "@/integrations/supabase/client";
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
      console.log("📞 [USERS] Calling admin API...");
      const response = await adminAPI.listUsers();
      
      if (response.error) {
        console.error("❌ [USERS] Admin API error:", response.error);
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
      
      // Convert auth users to our user format
      const mappedUsers = authUsers.map((authUser: any) => {
        const email = authUser.email || '';
        
        // Use metadata or email for name
        const name = authUser.user_metadata?.name || email.split('@')[0] || 'Usuário';
        const roleFromMetadata = authUser.user_metadata?.role;
        
        // Use the mapUserRole function to convert string role to UserRole enum
        const userRole = mapUserRole(roleFromMetadata, email);
        
        console.log(`👤 [USERS] Mapping user ${name}:`, {
          email,
          metadataRole: roleFromMetadata,
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
