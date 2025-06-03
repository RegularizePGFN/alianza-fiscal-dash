
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FixedCost {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFixedCosts() {
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching fixed costs...');

      const { data, error } = await supabase
        .from('company_costs')
        .select('*')
        .eq('type', 'fixed')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Fixed costs query result:', { data, error });

      if (error) {
        console.error('Error fetching fixed costs:', error);
        throw error;
      }

      setCosts(data || []);
      console.log('Fixed costs loaded successfully:', data?.length || 0, 'items');
    } catch (error: any) {
      console.error('Erro ao buscar custos fixos:', error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar os custos fixos: ${error.message}`,
        variant: "destructive"
      });
      setCosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  return {
    costs,
    loading,
    fetchCosts
  };
}
