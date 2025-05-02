
import { useState, useEffect } from "react";
import { User, UserRole } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_EMAILS } from "@/contexts/auth/utils";

export function useUsers() {
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, get all users from auth.users via admin API
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error listing users:", authError);
        throw authError;
      }
      
      if (!authData?.users) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      // Then, get profile information
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      // Merge auth users with profiles data
      const mergedUsers = authData.users.map(authUser => {
        // Find the matching profile or create an empty object with type annotation
        const profile = profilesData?.find(p => p.id === authUser.id) || {} as {
          name?: string;
          role?: UserRole;
        };
        
        return {
          id: authUser.id,
          name: profile.name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          role: profile.role as UserRole || UserRole.SALESPERSON,
          created_at: authUser.created_at,
        };
      });
      
      // Filter out admin users (those with emails in ADMIN_EMAILS)
      const filteredUsers = mergedUsers.filter(u => !ADMIN_EMAILS.includes(u.email.toLowerCase()));
      
      setUsers(filteredUsers);
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
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading, error, fetchUsers };
}
