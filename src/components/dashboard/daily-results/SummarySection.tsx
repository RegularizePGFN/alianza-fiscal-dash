
import { formatCurrency } from "@/lib/utils";
import { DailySummaryCard } from "./DailySummaryCard";
import { Sale } from "@/lib/types";

interface SummarySectionProps {
  todaySales: Sale[];
  currentDate: Date;
  totalSalesAmount: number;
  totalFeesAmount: number;
  salesCount: number;
}

export const SummarySection = ({
  todaySales,
  currentDate,
  totalSalesAmount,
  totalFeesAmount,
  salesCount,
}: SummarySectionProps) => {
  // Format the date for display
  const formattedDate = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DailySummaryCard 
        todaySales={todaySales}
        currentDate={formattedDate}
        totalSalesAmount={totalSalesAmount}
        totalFeesAmount={totalFeesAmount}
        salesCount={salesCount}
      />
    </div>
  );
};
