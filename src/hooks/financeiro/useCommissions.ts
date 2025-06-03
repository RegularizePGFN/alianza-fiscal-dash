
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateCommission } from '@/lib/utils';

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

      // Criar mapa de perfis
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

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

      // Calcular comissões para cada vendedor usando a MESMA lógica da aba comissões
      const commissionsArray = Object.values(salesByPerson).map((person: any) => {
        const profile = profilesMap.get(person.salesperson_id);
        const contractType = profile?.contract_type || 'PJ';
        
        let totalSales = 0;
        
        // Calcular total de vendas
        person.sales.forEach((sale: any) => {
          totalSales += Number(sale.gross_amount);
        });
        
        // Usar a MESMA função de cálculo que a aba comissões
        const commission = calculateCommission(totalSales, contractType);
        
        console.log(`Comissão calculada para ${person.name}:`, {
          totalSales,
          contractType,
          commissionAmount: commission.amount,
          commissionRate: commission.rate
        });
        
        return {
          name: person.name,
          totalSales,
          totalCommission: commission.amount,
          salesCount: person.sales.length,
          contractType
        };
      });

      setCommissions(commissionsArray);
      console.log('Commissions calculated with unified logic:', commissionsArray);
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
