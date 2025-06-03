
import { useState, useEffect, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching fixed costs...');
      
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const { data, error } = await supabase
        .from('company_costs')
        .select('*')
        .eq('type', 'fixed')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .abortSignal(signal);

      console.log('Fixed costs query result:', { data, error });

      if (error) {
        console.error('Error fetching fixed costs:', error);
        throw error;
      }

      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        setCosts(data || []);
        console.log('Fixed costs loaded successfully:', data?.length || 0, 'items');
      }
    } catch (error: any) {
      // Don't show error if request was aborted (expected behavior)
      if (error.name === 'AbortError') {
        console.log('Request was aborted - this is expected when switching between requests');
        return;
      }
      
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
    
    // Cleanup function to abort request when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    costs,
    loading,
    fetchCosts
  };
}
