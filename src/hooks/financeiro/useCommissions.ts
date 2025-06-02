
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  COMMISSION_RATE_PJ_BELOW_GOAL, 
  COMMISSION_RATE_PJ_ABOVE_GOAL,
  COMMISSION_RATE_CLT_BELOW_GOAL,
  COMMISSION_RATE_CLT_ABOVE_GOAL,
  COMMISSION_GOAL_AMOUNT 
} from '@/lib/constants';

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

      // Buscar perfis dos vendedores para pegar o tipo de contrato
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, contract_type')
        .eq('role', 'vendedor');

      if (profilesError) throw profilesError;

      // Buscar metas mensais dos vendedores
      const { data: goals, error: goalsError } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      if (goalsError) throw goalsError;

      // Criar mapa de perfis e metas
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const goalsMap = new Map(goals?.map(g => [g.user_id, g]) || []);

      // Calcular comissões por vendedor usando a lógica correta
      const commissionsByPerson = sales?.reduce((acc: any, sale) => {
        const profile = profilesMap.get(sale.salesperson_id);
        const goal = goalsMap.get(sale.salesperson_id);
        const contractType = profile?.contract_type || 'PJ';
        const goalAmount = goal?.goal_amount || COMMISSION_GOAL_AMOUNT;
        
        if (!acc[sale.salesperson_name]) {
          acc[sale.salesperson_name] = {
            name: sale.salesperson_name,
            totalSales: 0,
            totalCommission: 0,
            salesCount: 0,
            contractType: contractType,
            goalAmount: goalAmount
          };
        }
        
        acc[sale.salesperson_name].totalSales += Number(sale.gross_amount);
        acc[sale.salesperson_name].salesCount += 1;
        
        return acc;
      }, {}) || {};

      // Calcular comissões finais para cada vendedor
      const commissionsArray = Object.values(commissionsByPerson).map((person: any) => {
        const totalSales = person.totalSales;
        const contractType = person.contractType;
        const goalAmount = person.goalAmount;
        
        let totalCommission = 0;
        
        if (contractType === 'CLT') {
          // Lógica CLT: 5% até a meta, 10% acima da meta
          if (totalSales <= goalAmount) {
            totalCommission = totalSales * COMMISSION_RATE_CLT_BELOW_GOAL;
          } else {
            totalCommission = (goalAmount * COMMISSION_RATE_CLT_BELOW_GOAL) + 
                            ((totalSales - goalAmount) * COMMISSION_RATE_CLT_ABOVE_GOAL);
          }
        } else {
          // Lógica PJ: 20% até a meta, 25% acima da meta
          if (totalSales <= goalAmount) {
            totalCommission = totalSales * COMMISSION_RATE_PJ_BELOW_GOAL;
          } else {
            totalCommission = (goalAmount * COMMISSION_RATE_PJ_BELOW_GOAL) + 
                            ((totalSales - goalAmount) * COMMISSION_RATE_PJ_ABOVE_GOAL);
          }
        }
        
        return {
          ...person,
          totalCommission
        };
      });

      setCommissions(commissionsArray);
      console.log('Commissions calculated with correct logic:', commissionsArray);
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
