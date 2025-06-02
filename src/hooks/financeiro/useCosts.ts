
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
      console.log('Fetching costs...');
      
      const { data, error } = await supabase
        .from('company_costs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Costs query result:', { data, error });

      if (error) {
        console.error('Error fetching costs:', error);
        throw error;
      }

      setCosts(data || []);
      console.log('Costs loaded successfully:', data?.length || 0, 'items');
    } catch (error: any) {
      console.error('Erro ao buscar custos:', error);
      
      // Verificar se é um erro de permissão
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar os dados financeiros.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: `Não foi possível carregar os custos: ${error.message}`,
          variant: "destructive"
        });
      }
      
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
