
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Sale, UserRole, PaymentMethod } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { DailySummaryCard } from "./DailySummaryCard";
import { DailySalesTeamCard } from "./DailySalesTeamCard";
import { DailyResultsProvider } from "./DailyResultsContext";
import { formatDate, getTodayISO } from "@/lib/utils";
import { convertToPaymentMethod } from "@/hooks/sales/saleUtils";

interface DailyResultsProps {
  salesData: Sale[];
}

export function DailyResultsCard({ salesData }: DailyResultsProps) {
  const { user } = useAuth();
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [previousDaySales, setPreviousDaySales] = useState<Sale[]>([]);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDailyData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get today's date in ISO format
        const today = getTodayISO();
        
        // Calculate yesterday's date
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];
        
        // Filter today's sales
        const todaySalesArr = salesData.filter(sale => 
          sale.sale_date === today
        );
        
        // Fetch yesterday's sales
        const { data: yesterdaySales, error } = await supabase
          .from("sales")
          .select("*")
          .eq("sale_date", yesterday);
        
        if (error) {
          console.error("Error fetching yesterday's sales:", error);
        }
        
        const formattedYesterdaySales: Sale[] = (yesterdaySales || []).map(sale => ({
          id: sale.id,
          salesperson_id: sale.salesperson_id,
          salesperson_name: sale.salesperson_name || "Sem nome",
          gross_amount: Number(sale.gross_amount),
          net_amount: Number(sale.gross_amount),
          payment_method: convertToPaymentMethod(sale.payment_method),
          installments: sale.installments || 1,
          sale_date: sale.sale_date,
          created_at: sale.created_at,
          client_name: sale.client_name || "Cliente não identificado",
          client_phone: sale.client_phone || "",
          client_document: sale.client_document || "",
        }));
        
        setTodaySales(todaySalesArr);
        setPreviousDaySales(formattedYesterdaySales);
        setCurrentDate(formatDate(new Date()));
      } catch (error) {
        console.error("Error in daily data processing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDailyData();
  }, [salesData, user]);
  
  // Only admin users can see this card
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }
  
  return (
    <DailyResultsProvider>
      <div className="grid gap-4 md:grid-cols-2">
        <DailySummaryCard 
          todaySales={todaySales} 
          previousDaySales={previousDaySales}
          currentDate={currentDate} 
        />
        <DailySalesTeamCard 
          todaySales={todaySales} 
          currentDate={currentDate} 
        />
      </div>
    </DailyResultsProvider>
  );
}
