
import { useMemo } from "react";
import { Sale } from "@/lib/types";
import { formatCurrency, getTodayISO } from "@/lib/utils";
import { SummarySection } from "./SummarySection";
import { SalespeopleTable } from "./SalespeopleTable";

interface DailyResultsContentProps {
  salesData: Sale[];
}

export const DailyResultsContent = ({ salesData }: DailyResultsContentProps) => {
  // Filter today's sales
  const todaySales = useMemo(() => {
    const todayStr = getTodayISO();
    return salesData.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate.toISOString().split('T')[0] === todayStr;
    });
  }, [salesData]);

  // Calculate summary data
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalFeesAmount = todaySales.reduce((sum, sale) => sum + (sale.fees || 0), 0);
  const salesCount = todaySales.length;
  const currentDate = new Date();
  
  // Group by salesperson
  const salesBySalesperson = useMemo(() => {
    const grouped = todaySales.reduce((acc: Record<string, any>, sale) => {
      const name = sale.salesperson || "Não atribuído";
      if (!acc[name]) {
        acc[name] = {
          name,
          sales: [],
          proposalsSent: 0, // This would need to be populated from proposals data
        };
      }
      acc[name].sales.push(sale);
      return acc;
    }, {});

    return Object.values(grouped).map((group: any) => ({
      name: group.name,
      salesCount: group.sales.length,
      salesAmount: formatCurrency(group.sales.reduce((sum: number, s: Sale) => sum + s.amount, 0)),
      fees: formatCurrency(group.sales.reduce((sum: number, s: Sale) => sum + (s.fees || 0), 0)),
      proposalsSent: group.proposalsSent,
    }));
  }, [todaySales]);

  return (
    <div className="space-y-6">
      <SummarySection 
        todaySales={todaySales}
        currentDate={currentDate}
        totalSalesAmount={totalSalesAmount}
        totalFeesAmount={totalFeesAmount}
        salesCount={salesCount}
      />
      <SalespeopleTable salespeopleData={salesBySalesperson} />
    </div>
  );
};

// Default export for compatibility
export default DailyResultsContent;
