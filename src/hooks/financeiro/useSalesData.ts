
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSalesData() {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      // Adicionar timeout personalizado para evitar statement timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) throw error;

      setSalesData(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar dados de vendas:', error);
      
      if (error.name === 'AbortError') {
        toast({
          title: "Timeout",
          description: "A consulta de vendas demorou muito para responder. Tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados de vendas.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return {
    salesData,
    loading,
    fetchSalesData
  };
}
