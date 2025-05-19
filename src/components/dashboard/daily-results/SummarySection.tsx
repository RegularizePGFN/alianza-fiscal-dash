
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
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DailySummaryCard 
        todaySales={todaySales}
        currentDate={currentDate}
        totalSalesAmount={totalSalesAmount}
        totalFeesAmount={totalFeesAmount}
        salesCount={salesCount}
      />
    </div>
  );
};
