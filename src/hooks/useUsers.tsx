
import { useState, useEffect, useRef } from "react";
import { User, UserRole } from "@/lib/types";
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
  
  // Fetch users from Supabase
  const fetchUsers = async () => {
    // Evitar chamadas duplicadas
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch profiles directly from the profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Profiles data:", profilesData);
      
      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        setIsLoading(false);
        isFetchingRef.current = false; // Important: reset the flag before returning
        return;
      }
      
      // Convert profiles to users
      const mappedUsers = profilesData.map(profile => {
        const email = profile.email || '';
        
        // Use the mapUserRole function to convert string role to UserRole enum
        const userRole = mapUserRole(profile.role, email);
        
        console.log(`Mapping user ${profile.name} with role ${profile.role} to ${userRole}`);
        
        return {
          id: profile.id,
          name: profile.name || email.split('@')[0] || 'Usuário',
          email: email,
          role: userRole,
          created_at: profile.created_at,
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
