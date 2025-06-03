
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
      console.log("Fetching users from admin API...");
      const response = await adminAPI.listUsers();
      
      if (response.error) {
        console.error("Error fetching users:", response.error);
        throw new Error(response.error.message);
      }
      
      console.log("Auth users data:", response.data);
      
      if (!response.data?.users || response.data.users.length === 0) {
        setUsers([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // Fetch profile data for all users
      console.log("Fetching profile data...");
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profile data if there's an error
      }

      console.log("Profiles data:", profilesData);
      
      // Convert auth users to our user format, merging with profile data
      const mappedUsers = response.data.users.map((authUser: any) => {
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
      
      console.log("Final users list:", mappedUsers);
      setUsers(mappedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Falha ao carregar os usuários.");
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Importante: resetar a flag após a conclusão
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading, error, fetchUsers };
}
