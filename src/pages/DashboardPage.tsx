
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

// Mock sales data - updated with client information
const mockSales: Sale[] = [
  {
    id: "1",
    salesperson_id: "3",
    salesperson_name: "Vendedor Silva",
    gross_amount: 5000,
    net_amount: 5000, // Using the same value for both since net_amount will be removed later
    payment_method: PaymentMethod.BOLETO,
    installments: 1,
    sale_date: "2025-04-20",
    client_name: "João Silva",
    client_phone: "+5521999999999",
    client_document: "123.456.789-00"
  },
  {
    id: "2",
    salesperson_id: "3",
    salesperson_name: "Vendedor Silva",
    gross_amount: 3500,
    net_amount: 3500,
    payment_method: PaymentMethod.PIX,
    installments: 1,
    sale_date: "2025-04-25",
    client_name: "Maria Oliveira",
    client_phone: "+5521888888888",
    client_document: "987.654.321-00"
  },
  {
    id: "3",
    salesperson_id: "4",
    salesperson_name: "Vendedor Santos",
    gross_amount: 7000,
    net_amount: 7000,
    payment_method: PaymentMethod.CREDIT,
    installments: 3,
    sale_date: "2025-04-28",
    client_name: "Empresa ABC Ltda",
    client_phone: "+5521777777777",
    client_document: "12.345.678/0001-90"
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<SalesSummary>({
    total_sales: 0,
    total_gross: 0,
    total_net: 0,
    projected_commission: 0,
    goal_amount: DEFAULT_GOAL_AMOUNT,
    goal_percentage: 0,
  });

  useEffect(() => {
    // Filter sales based on user role
    // Admin/Manager see all sales, salespeople see only their own
    let filteredSales = [...mockSales];

    if (user && user.role === UserRole.SALESPERSON) {
      filteredSales = mockSales.filter(sale => sale.salesperson_id === user.id);
    }

    setSalesData(filteredSales);

    // Calculate summary - using gross values directly as final values
    const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.gross_amount, 0);
    const goalAmount = DEFAULT_GOAL_AMOUNT;
    
    // Commission rate depends on whether the goal was met
    const commissionRate = totalAmount >= goalAmount ? 0.25 : 0.2;
    const projectedCommission = totalAmount * commissionRate;

    setSummary({
      total_sales: filteredSales.length,
      total_gross: totalAmount,
      total_net: totalAmount,  // Keeping this for now to avoid breaking changes
      projected_commission: projectedCommission,
      goal_amount: goalAmount,
      goal_percentage: Math.min(totalAmount / goalAmount, 2),
    });
  }, [user]);

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
      </div>
    </AppLayout>
  );
}
