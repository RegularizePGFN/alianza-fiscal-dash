
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Proposal {
  id: string;
  userId: string;
  createdAt: string;
  data?: {
    feesValue?: string | number;
  };
}

export function useDashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('proposals')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        // Transform data to match expected format
        const formattedProposals = data.map((proposal: any) => ({
          id: proposal.id,
          userId: proposal.user_id,
          createdAt: proposal.created_at,
          data: proposal.data
        }));
        
        setProposals(formattedProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProposals();
  }, []);
  
  return { proposals, isLoading };
}
