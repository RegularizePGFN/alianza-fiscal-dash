
import { useMemo } from "react";
import { Sale } from "@/lib/types";
import { formatCurrency, getTodayISO } from "@/lib/utils";
import { SummarySection } from "./SummarySection";
import { SalespeopleTable } from "./SalespeopleTable";
import { DailySalesperson } from "./types";

interface DailyResultsContentProps {
  salesData: Sale[];
}

export const DailyResultsContent = ({ salesData }: DailyResultsContentProps) => {
  // Filter today's sales
  const todaySales = useMemo(() => {
    const todayStr = getTodayISO();
    return salesData.filter((sale) => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.toISOString().split('T')[0] === todayStr;
    });
  }, [salesData]);

  // Calculate summary data
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);
  const totalFeesAmount = todaySales.reduce((sum, sale) => sum + 0, 0); // No fees in Sale type, using 0
  const salesCount = todaySales.length;
  const currentDate = new Date();
  
  // Group by salesperson
  const salesBySalesperson = useMemo(() => {
    const grouped = todaySales.reduce((acc: Record<string, any>, sale) => {
      const name = sale.salesperson_name || "Não atribuído";
      if (!acc[name]) {
        acc[name] = {
          id: sale.salesperson_id,
          name,
          sales: [],
          proposalsCount: 0, // This would need to be populated from proposals data
        };
      }
      acc[name].sales.push(sale);
      return acc;
    }, {});

    return Object.values(grouped).map((group: any) => ({
      id: group.id,
      name: group.name,
      salesCount: group.sales.length,
      salesAmount: group.sales.reduce((sum: number, s: Sale) => sum + s.gross_amount, 0),
      feesAmount: 0, // No fees in Sale type
      proposalsCount: group.proposalsCount,
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
      <SalespeopleTable salespeople={salesBySalesperson} />
    </div>
  );
};

// Default export for compatibility
export default DailyResultsContent;
