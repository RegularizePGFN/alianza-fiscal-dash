
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCommissions(selectedMonth: number, selectedYear: number) {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching commissions for month:', selectedMonth, 'year:', selectedYear);
      
      // Buscar vendas do mês selecionado
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', startDate.toISOString().split('T')[0])
        .lte('sale_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      // Calcular comissões por vendedor
      const commissionsByPerson = sales?.reduce((acc: any, sale) => {
        const commission = Number(sale.gross_amount) * 0.05; // 5% de comissão
        
        if (!acc[sale.salesperson_name]) {
          acc[sale.salesperson_name] = {
            name: sale.salesperson_name,
            totalSales: 0,
            totalCommission: 0,
            salesCount: 0
          };
        }
        
        acc[sale.salesperson_name].totalSales += Number(sale.gross_amount);
        acc[sale.salesperson_name].totalCommission += commission;
        acc[sale.salesperson_name].salesCount += 1;
        
        return acc;
      }, {}) || {};

      setCommissions(Object.values(commissionsByPerson));
      console.log('Commissions calculated:', Object.values(commissionsByPerson));
    } catch (error: any) {
      console.error('Erro ao buscar comissões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível calcular as comissões.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [selectedMonth, selectedYear]);

  const totalCommissions = useMemo(() => {
    return commissions.reduce((total, commission) => total + commission.totalCommission, 0);
  }, [commissions]);

  return {
    commissions,
    totalCommissions,
    loading,
    fetchCommissions
  };
}
