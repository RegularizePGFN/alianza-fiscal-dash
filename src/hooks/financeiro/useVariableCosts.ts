
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VariableCost {
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

export function useVariableCosts(selectedMonth: string) {
  const [costs, setCosts] = useState<VariableCost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching variable costs for month:', selectedMonth);

      // Parse the selected month
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;

      const { data, error } = await supabase
        .from('company_costs')
        .select('*')
        .eq('type', 'variable')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('Variable costs query result:', { data, error });

      if (error) {
        console.error('Error fetching variable costs:', error);
        throw error;
      }

      // Filter costs that are active in the selected month
      const filteredCosts = data?.filter(cost => {
        const costStartDate = cost.start_date ? new Date(cost.start_date) : null;
        const costEndDate = cost.end_date ? new Date(cost.end_date) : null;
        const monthStart = new Date(`${year}-${month}-01`);
        const monthEnd = new Date(parseInt(year), parseInt(month), 0); // Last day of month

        // If no start date, assume it's active
        if (!costStartDate) return true;

        // If start date is after the month, not active
        if (costStartDate > monthEnd) return false;

        // If end date exists and is before the month, not active
        if (costEndDate && costEndDate < monthStart) return false;

        return true;
      }) || [];

      setCosts(filteredCosts);
      console.log('Variable costs loaded successfully:', filteredCosts.length, 'items');
    } catch (error: any) {
      console.error('Erro ao buscar custos variáveis:', error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar os custos variáveis: ${error.message}`,
        variant: "destructive"
      });
      setCosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [selectedMonth]);

  return {
    costs,
    loading,
    fetchCosts
  };
}
