
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalespersonCommission, SummaryTotals } from "@/components/dashboard/salespeople-commissions/types";
import { getBusinessDaysInMonth, getBusinessDaysElapsedInMonth } from "@/components/dashboard/salespeople-commissions/utils";
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from "@/lib/constants";
import { format, isWeekend } from "date-fns";

interface UseCommissionsDataProps {
  selectedMonth: string; // Format: "YYYY-MM"
}

export function useCommissionsData({ selectedMonth }: UseCommissionsDataProps) {
  const [salespeople, setSalespeople] = useState<SalespersonCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCommissionsData = async () => {
      try {
        setLoading(true);
        
        const [year, month] = selectedMonth.split('-').map(Number);
        const totalBusinessDays = getBusinessDaysInMonth(month, year);
        const businessDaysElapsed = getBusinessDaysElapsedInMonth(month, year);
        const businessDaysRemaining = totalBusinessDays - businessDaysElapsed;
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "vendedor");
          
        if (profilesError) {
          console.error("Error fetching salespeople:", profilesError);
          toast({
            title: "Erro ao carregar vendedores",
            description: "Não foi possível carregar os dados dos vendedores.",
            variant: "destructive",
          });
          return;
        }
        
        // Get all business days of the selected month
        const allBusinessDays = getAllBusinessDaysInMonth(month, year);
        
        const commissionData = await Promise.all(
          profilesData.map(async (profile) => {
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endDate = new Date(year, month, 0).toISOString().split('T')[0];
            
            const { data: salesData, error: salesError } = await supabase
              .from("sales")
              .select("*")
              .eq("salesperson_id", profile.id)
              .gte("sale_date", startDate)
              .lte("sale_date", endDate);
              
            if (salesError) {
              console.error(`Error fetching sales for ${profile.name}:`, salesError);
              return null;
            }
            
            const { data: goalData } = await supabase
              .from("monthly_goals")
              .select("goal_amount")
              .eq("user_id", profile.id)
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
            
            const zeroDaysCount = allBusinessDays.filter(day => !salesDates.has(day)).length;
            
            return {
              id: profile.id,
              name: profile.name || "Sem nome",
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
            };
          })
        );
        
        const validCommissions = commissionData.filter(Boolean) as SalespersonCommission[];
        setSalespeople(validCommissions);
      } catch (error) {
        console.error("Error fetching commissions data:", error);
        toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível carregar os dados de comissões.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommissionsData();
  }, [selectedMonth, toast]);
  
  // Get all business days of a specific month
  function getAllBusinessDaysInMonth(month: number, year: number): string[] {
    const result: string[] = [];
    const lastDay = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day);
      
      // Skip weekends
      if (!isWeekend(date)) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        result.push(formattedDate);
      }
    }
    
    return result;
  }
  
  // Calculate summary totals
  const summaryTotals: SummaryTotals = {
    salesCount: salespeople.reduce((sum, person) => sum + person.salesCount, 0),
    totalSales: salespeople.reduce((sum, person) => sum + person.totalSales, 0),
    goalAmount: salespeople.reduce((sum, person) => sum + person.goalAmount, 0),
    commissionGoalAmount: salespeople.reduce((sum, person) => sum + person.commissionGoalAmount, 0),
    goalPercentage: salespeople.length > 0 
      ? salespeople.reduce((sum, person) => sum + person.goalPercentage, 0) / salespeople.length 
      : 0,
    metaGap: salespeople.reduce((sum, person) => sum + person.metaGap, 0),
    remainingDailyTarget: salespeople.reduce((sum, person) => sum + person.remainingDailyTarget, 0),
    projectedCommission: salespeople.reduce((sum, person) => sum + person.projectedCommission, 0),
    zeroDaysCount: 0,
  };
  
  return {
    salespeople,
    summaryTotals,
    loading
  };
}
