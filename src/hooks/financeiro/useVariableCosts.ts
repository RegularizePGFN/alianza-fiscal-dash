
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useVariableCosts(selectedMonth: string) {
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching variable costs for month:', selectedMonth);
      
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Parse the selected month
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;

      const { data, error } = await supabase
        .from('company_costs')
        .select('*')
        .eq('type', 'variable')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${endDate}`)
        .or(`end_date.is.null,end_date.gte.${startDate}`)
        .order('created_at', { ascending: false })
        .abortSignal(signal);

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

      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        setCosts(filteredCosts);
        console.log('Variable costs loaded successfully:', filteredCosts.length, 'items');
      }
    } catch (error: any) {
      // Don't show error if request was aborted (expected behavior)
      if (error.name === 'AbortError') {
        console.log('Request was aborted - this is expected when switching between requests');
        return;
      }
      
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
    
    // Cleanup function to abort request when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedMonth]);

  return {
    costs,
    loading,
    fetchCosts
  };
}
