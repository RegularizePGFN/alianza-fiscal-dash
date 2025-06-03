
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateCommission } from '@/lib/utils';
import { calculateSupervisorBonus, isSupervisor, SUPERVISOR_EMAIL } from '@/lib/supervisorUtils';

export function useCommissions(selectedMonth: number, selectedYear: number) {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [supervisorBonus, setSupervisorBonus] = useState<any>(null);
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
        .select('id, name, contract_type, email')
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

      // Calcular total de vendas da equipe (excluindo supervisor)
      let teamTotalSales = 0;
      
      // Calcular comissões para cada vendedor usando a MESMA lógica da aba comissões
      const commissionsArray = Object.values(salesByPerson).map((person: any) => {
        const profile = profilesMap.get(person.salesperson_id);
        const contractType = profile?.contract_type || 'PJ';
        
        let totalSales = 0;
        
        // Calcular total de vendas
        person.sales.forEach((sale: any) => {
          totalSales += Number(sale.gross_amount);
        });
        
        // Se não for supervisor, adicionar ao total da equipe
        if (!isSupervisor(profile?.email || '')) {
          teamTotalSales += totalSales;
        }
        
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
          contractType,
          isSupervisor: isSupervisor(profile?.email || '')
        };
      });

      // Calcular bonificação da supervisora
      const supervisorBonusData = calculateSupervisorBonus(teamTotalSales);
      setSupervisorBonus({
        ...supervisorBonusData,
        name: 'Vanessa Martins (Supervisora)'
      });

      setCommissions(commissionsArray);
      console.log('Commissions calculated with unified logic:', commissionsArray);
      console.log('Team total sales:', teamTotalSales);
      console.log('Supervisor bonus:', supervisorBonusData);
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
    const vendedorCommissions = commissions.reduce((total, commission) => total + commission.totalCommission, 0);
    const supervisorAmount = supervisorBonus?.amount || 0;
    return vendedorCommissions + supervisorAmount;
  }, [commissions, supervisorBonus]);

  return {
    commissions,
    supervisorBonus,
    totalCommissions,
    loading,
    fetchCommissions
  };
}
