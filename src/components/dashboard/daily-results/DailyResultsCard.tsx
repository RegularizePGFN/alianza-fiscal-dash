
import { useEffect, useState } from "react";
import { Sale } from "@/lib/types";
import { getTodayISO } from "@/lib/utils";
import { DailyResultsProps } from "./types";
import { DailySummaryCard } from "./DailySummaryCard";
import { DailySalesTeamCard } from "./DailySalesTeamCard";

export function DailyResultsCard({ salesData }: DailyResultsProps) {
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [currentDate, setCurrentDate] = useState<string>("");
  
  useEffect(() => {
    // Get today's date in ISO format (YYYY-MM-DD)
    const todayStr = getTodayISO();
    
    // Format current date for display (dd/mm/yyyy in Portuguese format)
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('pt-BR').format(today);
    setCurrentDate(formattedDate);

    // Filter sales for today by exact string match of the date (YYYY-MM-DD)
    // This ensures we only count sales with the exact date match
    const filteredSales = salesData.filter(sale => {
      console.log(`Comparing sale date: "${sale.sale_date}" with today: "${todayStr}"`);
      return sale.sale_date === todayStr;
    });
    
    console.log(`Found ${filteredSales.length} sales for today (${todayStr})`);
    setTodaySales(filteredSales);
  }, [salesData]);

  // We're going to return a div with two cards side-by-side
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DailySummaryCard todaySales={todaySales} currentDate={currentDate} />
      <DailySalesTeamCard todaySales={todaySales} currentDate={currentDate} />
    </div>
  );
}
