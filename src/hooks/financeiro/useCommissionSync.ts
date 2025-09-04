import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const COMMISSION_COST_NAME = 'Comissões dos Vendedores';
const COMMISSION_COST_CATEGORY = 'Pessoal';

interface CommissionSyncOptions {
  onCommissionUpdate?: () => void;
}

export function useCommissionSync(options?: CommissionSyncOptions) {
  
  const syncCommissionsForAllMonths = async () => {
    try {
      console.log('Sincronizando comissões para todos os meses...');
      
      // Buscar todas as vendas
      const { data: allSales, error: salesError } = await supabase
        .from('sales')
        .select('*');

      if (salesError) {
        console.error('Erro ao buscar vendas:', salesError);
        return;
      }

      if (!allSales || allSales.length === 0) {
        console.log('Nenhuma venda encontrada');
        return;
      }

      // Agrupar vendas por mês/ano
      const salesByMonth: Record<string, any[]> = {};
      
      allSales.forEach(sale => {
        const saleDate = new Date(sale.sale_date);
        const monthKey = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = [];
        }
        
        salesByMonth[monthKey].push(sale);
      });

      // Buscar perfis dos vendedores
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, contract_type, email')
        .eq('role', 'vendedor');

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return;
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Para cada mês, calcular comissões e criar/atualizar custo
      for (const [monthKey, monthSales] of Object.entries(salesByMonth)) {
        const [year, month] = monthKey.split('-').map(Number);
        
        const commissionAmount = await calculateMonthCommissions(monthSales, profilesMap);
        
        if (commissionAmount > 0) {
          await upsertCommissionCost(commissionAmount, month, year);
        }
      }

      console.log('Sincronização de comissões concluída');
      
      if (options?.onCommissionUpdate) {
        options.onCommissionUpdate();
      }
      
    } catch (error) {
      console.error('Erro na sincronização de comissões:', error);
    }
  };

  const calculateMonthCommissions = async (monthSales: any[], profilesMap: Map<string, any>) => {
    try {
      // Importar as funções de cálculo dinamicamente para evitar dependências circulares
      const { calculateCommission } = await import('@/lib/utils');
      const { calculateSupervisorBonus, isSupervisor } = await import('@/lib/supervisorUtils');

      let totalTeamSales = 0;
      let totalCommissions = 0;

      // Agrupar vendas por vendedor
      const salesByPerson = monthSales.reduce((acc: any, sale) => {
        if (!acc[sale.salesperson_id]) {
          acc[sale.salesperson_id] = [];
        }
        acc[sale.salesperson_id].push(sale);
        return acc;
      }, {});

      // Calcular comissões por vendedor
      for (const [salespersonId, sales] of Object.entries(salesByPerson)) {
        const profile = profilesMap.get(salespersonId);
        const contractType = profile?.contract_type || 'PJ';
        
        const salespersonTotal = (sales as any[]).reduce((sum, sale) => sum + Number(sale.gross_amount), 0);
        
        // Se não for supervisor, adicionar ao total da equipe
        if (!isSupervisor(profile?.email || '')) {
          totalTeamSales += salespersonTotal;
        }
        
        const commission = calculateCommission(salespersonTotal, contractType);
        totalCommissions += commission.amount;
      }

      // Adicionar bônus da supervisora
      const supervisorBonus = calculateSupervisorBonus(totalTeamSales);
      totalCommissions += supervisorBonus.amount;

      return totalCommissions;
    } catch (error) {
      console.error('Erro no cálculo de comissões:', error);
      return 0;
    }
  };

  const upsertCommissionCost = async (amount: number, month: number, year: number) => {
    try {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      // Verificar se já existe um custo de comissões
      const { data: existingCost } = await supabase
        .from('company_costs')
        .select('*')
        .eq('name', COMMISSION_COST_NAME)
        .eq('type', 'fixed')
        .maybeSingle();

      const costData = {
        name: COMMISSION_COST_NAME,
        description: `Comissões calculadas automaticamente (atualizado em ${new Date().toLocaleDateString('pt-BR')})`,
        amount,
        type: 'fixed' as const,
        category: COMMISSION_COST_CATEGORY,
        is_active: true
      };

      if (existingCost) {
        // Atualizar apenas se o valor mudou significativamente
        if (Math.abs(Number(existingCost.amount) - amount) > 0.01) {
          await supabase
            .from('company_costs')
            .update({
              amount,
              description: costData.description,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCost.id);

          console.log(`Custo de comissão atualizado: R$ ${amount.toFixed(2)}`);
        }
      } else {
        // Criar novo custo
        await supabase
          .from('company_costs')
          .insert([costData]);

        console.log(`Custo de comissão criado: R$ ${amount.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar custo de comissão:', error);
    }
  };

  // Executar sincronização inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      syncCommissionsForAllMonths();
    }, 1000); // Delay para evitar múltiplas execuções

    return () => clearTimeout(timer);
  }, []);

  return {
    syncCommissionsForAllMonths
  };
}