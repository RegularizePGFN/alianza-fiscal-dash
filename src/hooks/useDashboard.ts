
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Proposal } from "@/lib/types/proposals";
import { supabase } from "@/integrations/supabase/client";

export function useDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch proposals from Supabase
        const { data, error } = await supabase
          .from("proposals")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("Error fetching proposals:", error);
          return;
        }
        
        // Format the proposals
        const formattedProposals = data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          userName: item.user_name || "",
          createdAt: item.created_at,
          data: item.data || {},
          imageUrl: item.image_url || "",
        }));
        
        setProposals(formattedProposals);
      } catch (error) {
        console.error("Error in proposals fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProposals();
  }, [user]);
  
  return {
    proposals,
    isLoading
  };
}
