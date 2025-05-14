
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { getTodayISO } from "@/lib/utils";
import { DailyResultsContent } from "./DailyResultsContent";
import { DailyResultsProvider } from "./DailyResultsContext";
import { DailyResultsProps } from "./types";

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

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          Resultado do Dia - {currentDate}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <DailyResultsProvider>
          <DailyResultsContent 
            todaySales={todaySales}
            currentDate={currentDate}
          />
        </DailyResultsProvider>
      </CardContent>
    </Card>
  );
}
