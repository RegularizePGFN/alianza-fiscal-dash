
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { SalespersonCommission } from "@/components/dashboard/salespeople-commissions/types";
import { getBusinessDaysInMonth, getBusinessDaysElapsedInMonth } from "@/components/dashboard/salespeople-commissions/utils";
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from "@/lib/constants";

interface UseSalespersonCommissionDataProps {
  selectedMonth: string; // Format: "YYYY-MM"
}

export function useSalespersonCommissionData({ selectedMonth }: UseSalespersonCommissionDataProps) {
  const [salespersonData, setSalespersonData] = useState<SalespersonCommission | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSalespersonCommissionData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        const [year, month] = selectedMonth.split('-').map(Number);
        const totalBusinessDays = getBusinessDaysInMonth(month, year);
        const businessDaysElapsed = getBusinessDaysElapsedInMonth(month, year);
        const businessDaysRemaining = totalBusinessDays - businessDaysElapsed;
        
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        const { data: salesData, error: salesError } = await supabase
          .from("sales")
          .select("*")
          .eq("salesperson_id", user.id)
          .gte("sale_date", startDate)
          .lte("sale_date", endDate);
          
        if (salesError) {
          console.error(`Error fetching sales for ${user.name}:`, salesError);
          toast({
            title: "Erro ao carregar vendas",
            description: "Não foi possível carregar os dados de vendas.",
            variant: "destructive",
          });
          return;
        }
        
        const { data: goalData } = await supabase
          .from("monthly_goals")
          .select("goal_amount")
          .eq("user_id", user.id)
          .eq("month", month)
          .eq("year", year)
          .maybeSingle();
          
        const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.gross_amount), 0) || 0;
        const salesCount = salesData?.length || 0;
        const goalAmount = goalData?.goal_amount ? Number(goalData.goal_amount) : 0;
        
        // For commission calculation, we use the FIXED COMMISSION GOAL AMOUNT
        const commissionRate = totalSales >= COMMISSION_GOAL_AMOUNT 
          ? COMMISSION_RATE_ABOVE_GOAL 
          : COMMISSION_RATE_BELOW_GOAL;
          
        const projectedCommission = totalSales * commissionRate;
        
        const dailyTarget = goalAmount / totalBusinessDays;
        const expectedProgress = dailyTarget * businessDaysElapsed;
        const metaGap = totalSales - expectedProgress;
        
        const goalPercentage = expectedProgress > 0 ? (totalSales / expectedProgress) * 100 : 0;
        
        const remainingAmount = goalAmount - totalSales;
        const remainingDailyTarget = businessDaysRemaining > 0 ? remainingAmount / businessDaysRemaining : 0;
        
        // Calculate zero days count - days when the salesperson had no sales
        const salesDates = new Set(
          salesData?.map(sale => sale.sale_date) || []
        );
        
        const allBusinessDays = getAllBusinessDaysInMonth(month, year);
        const zeroDaysCount = allBusinessDays.filter(day => !salesDates.has(day)).length;
        
        setSalespersonData({
          id: user.id,
          name: user.name || "Sem nome",
          totalSales,
          goalAmount,
          commissionGoalAmount: COMMISSION_GOAL_AMOUNT,
          projectedCommission,
          goalPercentage,
          salesCount,
          metaGap,
          expectedProgress,
          remainingDailyTarget,
          zeroDaysCount,
        });
      } catch (error) {
        console.error("Error fetching salesperson commission data:", error);
        toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível carregar os dados de comissões.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalespersonCommissionData();
  }, [selectedMonth, user?.id, toast]);
  
  // Get all business days of a specific month
  function getAllBusinessDaysInMonth(month: number, year: number): string[] {
    const result: string[] = [];
    const lastDay = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        result.push(formattedDate);
      }
    }
    
    return result;
  }
  
  return {
    salespersonData,
    loading
  };
}
