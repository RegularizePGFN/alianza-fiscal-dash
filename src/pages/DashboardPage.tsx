
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { CommissionCard } from "@/components/dashboard/CommissionCard";
import { SalesTable } from "@/components/sales/SalesTable";
import { useAuth } from "@/contexts/AuthContext";
import { Sale, SalesSummary, UserRole } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { getCurrentMonthDates } from "@/lib/utils";
import { AreaChart, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary>({
    total_sales: 0,
    total_gross: 0,
    total_net: 0,
    projected_commission: 0,
    goal_amount: DEFAULT_GOAL_AMOUNT,
    goal_percentage: 0,
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Buscar as vendas do Supabase
        let query = supabase
          .from('sales')
          .select('*');
        
        // Filtrar por vendedor se o usuário for vendedor
        if (user.role === UserRole.SALESPERSON) {
          query = query.eq('salesperson_id', user.id);
        }
        
        const { data: salesData, error } = await query.order('sale_date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Buscar meta do usuário ou do time
        let monthlyGoal = DEFAULT_GOAL_AMOUNT;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Meses são 0-indexados em JS
        const currentYear = currentDate.getFullYear();
        
        let goalQuery = supabase
          .from('monthly_goals')
          .select('goal_amount')
          .eq('month', currentMonth)
          .eq('year', currentYear);
          
        if (user.role === UserRole.SALESPERSON) {
          goalQuery = goalQuery.eq('user_id', user.id);
        }
        
        const { data: goalData, error: goalError } = await goalQuery.limit(1).single();
        
        if (goalData && !goalError) {
          monthlyGoal = goalData.goal_amount;
        } else if (goalError && goalError.code !== 'PGRST116') { // PGRST116 é o erro quando nenhum registro é encontrado
          console.error('Erro ao buscar meta:', goalError);
        }
        
        if (salesData) {
          setSalesData(salesData);
          
          // Calcular resumo
          const totalAmount = salesData.reduce((sum, sale) => sum + sale.gross_amount, 0);
          
          // Taxa de comissão depende se a meta foi atingida
          const commissionRate = totalAmount >= monthlyGoal ? 0.25 : 0.2;
          const projectedCommission = totalAmount * commissionRate;
          
          setSummary({
            total_sales: salesData.length,
            total_gross: totalAmount,
            total_net: totalAmount,  // Mantendo isso para evitar quebrar alterações
            projected_commission: projectedCommission,
            goal_amount: monthlyGoal,
            goal_percentage: Math.min(totalAmount / monthlyGoal, 2),
          });
        }
      } catch (error: any) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalesData();
  }, [user, toast]);

  const { start: monthStart, end: monthEnd } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral de vendas e comissões para {monthLabel}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <SalesSummaryCard
                title="Total de Vendas"
                amount={summary.total_gross}
                description={`${summary.total_sales} ${summary.total_sales === 1 ? 'venda' : 'vendas'} no período`}
                icon={<ShoppingCart className="h-4 w-4" />}
                trend={{ value: 12, isPositive: true }}
              />

              <SalesSummaryCard
                title="Média por Venda"
                amount={summary.total_sales ? summary.total_gross / summary.total_sales : 0}
                description="Valor médio por transação"
                icon={<AreaChart className="h-4 w-4" />}
                trend={{ value: 3, isPositive: true }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <GoalProgressCard
                currentValue={summary.total_gross}
                goalValue={summary.goal_amount}
              />
              <CommissionCard
                totalSales={summary.total_gross}
                goalAmount={summary.goal_amount}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Últimas Vendas</h3>
              <SalesTable 
                sales={salesData} 
                showSalesperson={user?.role !== UserRole.SALESPERSON}
              />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
