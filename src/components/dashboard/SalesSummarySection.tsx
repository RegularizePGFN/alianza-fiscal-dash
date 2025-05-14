
import { ShoppingCart, AreaChart } from "lucide-react";
import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { DashboardTrends } from "@/hooks/dashboard/types";
import { SalesSummary } from "@/lib/types";

interface SalesSummarySectionProps {
  summary: SalesSummary;
  trends: DashboardTrends;
}

export function SalesSummarySection({ summary, trends }: SalesSummarySectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <SalesSummaryCard
        title="Total de Vendas"
        numericValue={summary.total_sales}
        description={`${summary.total_sales === 1 ? 'venda' : 'vendas'} no período`}
        icon={<ShoppingCart className="h-4 w-4" />}
        trend={trends.totalSalesTrend}
      />

      <SalesSummaryCard
        title="Média por Venda"
        amount={summary.total_sales ? summary.total_gross / summary.total_sales : 0}
        description="Valor médio por transação"
        icon={<AreaChart className="h-4 w-4" />}
        trend={trends.averageSaleTrend}
      />
      
      <SalesSummaryCard
        title="Total em Vendas"
        amount={summary.total_gross}
        description="Valor bruto acumulado"
        icon={<AreaChart className="h-4 w-4" />}
        trend={trends.totalGrossTrend || {value: 0, isPositive: true}}
        className="md:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
