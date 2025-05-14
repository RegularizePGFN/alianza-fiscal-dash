
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
    <div className="h-full">
      <SalesSummaryCard
        title="Total de Vendas"
        numericValue={summary.total_sales}
        description={`${summary.total_sales === 1 ? 'venda' : 'vendas'} no período`}
        icon={<ShoppingCart className="h-4 w-4" />}
        trend={trends.totalSalesTrend}
        className="h-full"
      />
    </div>
  );
}
