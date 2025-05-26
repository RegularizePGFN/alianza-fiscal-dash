
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
  const fetchUsers = async (forceRefresh = false) => {
    // Evitar chamadas duplicadas, mas permitir refresh forçado
    if (isFetchingRef.current && !forceRefresh) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear cache if forcing refresh
      if (forceRefresh) {
        console.log("Force refreshing users data...");
      }
      
      // Fetch profiles directly from the profiles table with fresh data
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Fresh profiles data:", profilesData);
      
      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      // Convert profiles to users with fresh role mapping
      const mappedUsers = profilesData.map(profile => {
        const email = profile.email || '';
        
        // Use the mapUserRole function to convert string role to UserRole enum
        const userRole = mapUserRole(profile.role, email);
        
        console.log(`Mapping user ${profile.name} with role "${profile.role}" to ${userRole}`);
        
        return {
          id: profile.id,
          name: profile.name || email.split('@')[0] || 'Usuário',
          email: email,
          role: userRole,
          created_at: profile.created_at,
        };
      });
      
      console.log("Final users list with updated roles:", mappedUsers);
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
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading, error, fetchUsers };
}
