
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

      // Agrupar vendas por vendedor
      const salesByPerson = sales?.reduce((acc: any, sale) => {
        if (!acc[sale.salesperson_id]) {
          acc[sale.salesperson_id] = {
            salesperson_id: sale.salesperson_id,
            name: sale.salesperson_name,
            sales: []
          };
        }
        acc[sale.salesperson_id].sales.push(sale);
        return acc;
      }, {}) || {};

      // Calcular comissões para cada vendedor usando a lógica EXATA da plataforma
      const commissionsArray = Object.values(salesByPerson).map((person: any) => {
        const profile = profilesMap.get(person.salesperson_id);
        const goal = goalsMap.get(person.salesperson_id);
        const contractType = profile?.contract_type || 'PJ';
        const goalAmount = goal?.goal_amount || COMMISSION_GOAL_AMOUNT;
        
        let totalSales = 0;
        let totalCommission = 0;
        
        // Calcular total de vendas
        person.sales.forEach((sale: any) => {
          totalSales += Number(sale.gross_amount);
        });
        
        // Aplicar a MESMA lógica de comissão que existe na plataforma
        if (contractType === 'CLT') {
          // CLT: 5% até a meta, 10% acima da meta
          if (totalSales <= goalAmount) {
            totalCommission = totalSales * COMMISSION_RATE_CLT_BELOW_GOAL;
          } else {
            totalCommission = (goalAmount * COMMISSION_RATE_CLT_BELOW_GOAL) + 
                            ((totalSales - goalAmount) * COMMISSION_RATE_CLT_ABOVE_GOAL);
          }
        } else {
          // PJ: 20% até a meta, 25% acima da meta
          if (totalSales <= goalAmount) {
            totalCommission = totalSales * COMMISSION_RATE_PJ_BELOW_GOAL;
          } else {
            totalCommission = (goalAmount * COMMISSION_RATE_PJ_BELOW_GOAL) + 
                            ((totalSales - goalAmount) * COMMISSION_RATE_PJ_ABOVE_GOAL);
          }
        }
        
        console.log(`Comissão calculada para ${person.name}:`, {
          totalSales,
          contractType,
          goalAmount,
          totalCommission,
          belowGoal: totalSales <= goalAmount ? totalSales * (contractType === 'CLT' ? COMMISSION_RATE_CLT_BELOW_GOAL : COMMISSION_RATE_PJ_BELOW_GOAL) : goalAmount * (contractType === 'CLT' ? COMMISSION_RATE_CLT_BELOW_GOAL : COMMISSION_RATE_PJ_BELOW_GOAL),
          aboveGoal: totalSales > goalAmount ? (totalSales - goalAmount) * (contractType === 'CLT' ? COMMISSION_RATE_CLT_ABOVE_GOAL : COMMISSION_RATE_PJ_ABOVE_GOAL) : 0
        });
        
        return {
          name: person.name,
          totalSales,
          totalCommission,
          salesCount: person.sales.length,
          contractType,
          goalAmount
        };
      });

      setCommissions(commissionsArray);
      console.log('Commissions calculated with correct platform logic:', commissionsArray);
      console.log('Total commissions:', commissionsArray.reduce((total, c) => total + c.totalCommission, 0));
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
