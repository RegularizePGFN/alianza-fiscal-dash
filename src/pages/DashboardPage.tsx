
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { CommissionCard } from "@/components/dashboard/CommissionCard";
import { SalesTable } from "@/components/sales/SalesTable";
import { useAuth } from "@/contexts/AuthContext";
import { Sale, SalesSummary, UserRole, PaymentMethod } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { getCurrentMonthDates } from "@/lib/utils";
import { AreaChart, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Função auxiliar para converter string para o enum PaymentMethod
const convertToPaymentMethod = (method: string): PaymentMethod => {
  switch (method) {
    case "Boleto":
      return PaymentMethod.BOLETO;
    case "Pix":
      return PaymentMethod.PIX;
    case "Crédito":
      return PaymentMethod.CREDIT;
    case "Débito":
      return PaymentMethod.DEBIT;
    default:
      return PaymentMethod.CREDIT; // Valor padrão
  }
};

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
        console.log("Buscando dados de vendas para", user.name);
        
        // Consulta direta sem filtros - RLS está desativado agora
        const { data: salesData, error } = await supabase
          .from('sales')
          .select('*')
          .order('sale_date', { ascending: false });
        
        if (error) {
          console.error("Erro ao buscar dados:", error);
          throw error;
        }
        
        console.log("Dados recebidos do Supabase:", salesData?.length || 0, "registros");
        
        // Filtramos no lado do cliente apenas se necessário
        let filteredData = salesData || [];
        if (user.role === UserRole.SALESPERSON) {
          filteredData = filteredData.filter(sale => sale.salesperson_id === user.id);
          console.log("Dados filtrados para vendedor:", filteredData.length, "registros");
        }
        
        // Buscar meta do usuário ou do time
        let monthlyGoal = DEFAULT_GOAL_AMOUNT;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Meses são 0-indexados em JS
        const currentYear = currentDate.getFullYear();
        
        const { data: goalData, error: goalError } = await supabase
          .from('monthly_goals')
          .select('goal_amount')
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .maybeSingle();
        
        if (goalData && !goalError) {
          monthlyGoal = goalData.goal_amount;
          console.log("Meta mensal encontrada:", monthlyGoal);
        } else if (goalError) {
          console.error('Erro ao buscar meta:', goalError);
        } else {
          console.log("Nenhuma meta encontrada, usando valor padrão:", DEFAULT_GOAL_AMOUNT);
        }
        
        if (filteredData.length > 0) {
          // Mapear os dados do Supabase para o formato da interface Sale
          const formattedSales: Sale[] = filteredData.map(sale => ({
            id: sale.id,
            salesperson_id: sale.salesperson_id,
            salesperson_name: sale.salesperson_name || "Sem nome",
            gross_amount: sale.gross_amount,
            net_amount: sale.gross_amount, // Usamos o gross_amount como net_amount
            payment_method: convertToPaymentMethod(sale.payment_method), // Convertendo string para enum
            installments: sale.installments || 1,
            sale_date: sale.sale_date,
            created_at: sale.created_at,
            client_name: sale.client_name || "Cliente não identificado",
            client_phone: sale.client_phone || "",
            client_document: sale.client_document || ""
          }));
          
          setSalesData(formattedSales);
          console.log("Dados formatados e definidos no estado:", formattedSales.length, "vendas");
          
          // Calcular resumo
          const totalAmount = formattedSales.reduce((sum, sale) => sum + sale.gross_amount, 0);
          
          // Taxa de comissão depende se a meta foi atingida
          const commissionRate = totalAmount >= monthlyGoal ? 0.25 : 0.2;
          const projectedCommission = totalAmount * commissionRate;
          
          setSummary({
            total_sales: formattedSales.length,
            total_gross: totalAmount,
            total_net: totalAmount,  // Mantendo isso para evitar quebrar alterações
            projected_commission: projectedCommission,
            goal_amount: monthlyGoal,
            goal_percentage: Math.min(totalAmount / monthlyGoal, 2),
          });
          
          console.log("Resumo calculado:", {
            total_sales: formattedSales.length,
            total_gross: totalAmount,
            goal_amount: monthlyGoal,
            goal_percentage: Math.min(totalAmount / monthlyGoal, 2),
          });
        } else {
          console.log("Nenhuma venda encontrada");
          // Definir dados vazios
          setSalesData([]);
          setSummary({
            total_sales: 0,
            total_gross: 0,
            total_net: 0,
            projected_commission: 0,
            goal_amount: monthlyGoal,
            goal_percentage: 0,
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
