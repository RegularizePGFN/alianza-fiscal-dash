
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCosts() {
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_costs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCosts(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar custos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os custos.",
        variant: "destructive"
      });
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
