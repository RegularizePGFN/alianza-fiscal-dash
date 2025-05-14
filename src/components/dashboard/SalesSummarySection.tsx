
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
    <div className="grid gap-4 md:grid-cols-2">
      <SalesSummaryCard
        title="Total de Vendas"
        amount={summary.total_sales} // Show count instead of amount
        description={`${summary.total_sales} ${summary.total_sales === 1 ? 'venda' : 'vendas'} no período`}
        icon={<ShoppingCart className="h-4 w-4" />}
        trend={trends.totalSalesTrend}
        isCount={true} // Add a flag to indicate this is a count, not currency
      />

      <SalesSummaryCard
        title="Média por Venda"
        amount={summary.total_sales ? summary.total_gross / summary.total_sales : 0}
        description="Valor médio por transação"
        icon={<AreaChart className="h-4 w-4" />}
        trend={trends.averageSaleTrend}
      />
    </div>
  );
}
