
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { SalespersonCommission } from "@/components/dashboard/salespeople-commissions/types";
import { getBusinessDaysInMonth, getBusinessDaysElapsedInMonth } from "@/components/dashboard/salespeople-commissions/utils";
import { COMMISSION_GOAL_AMOUNT } from "@/lib/constants";
import { calculateCommission } from "@/lib/utils";

interface UseSalespersonCommissionDataProps {
  selectedMonth: string; // Format: "YYYY-MM"
}

interface ExtendedSalespersonCommission extends SalespersonCommission {
  contractType: string;
}

export function useSalespersonCommissionData({ selectedMonth }: UseSalespersonCommissionDataProps) {
  const [salespersonData, setSalespersonData] = useState<ExtendedSalespersonCommission | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSalespersonCommissionData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const [year, month] = selectedMonth.split('-').map(Number);
        const totalBusinessDays = getBusinessDaysInMonth(month, year);
        const businessDaysElapsed = getBusinessDaysElapsedInMonth(month, year);
        const businessDaysRemaining = totalBusinessDays - businessDaysElapsed;
        
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        // Fetch all data in parallel for better performance
        const [salesResult, goalResult, profileResult] = await Promise.all([
          supabase
            .from("sales")
            .select("*")
            .eq("salesperson_id", user.id)
            .gte("sale_date", startDate)
            .lte("sale_date", endDate),
          supabase
            .from("monthly_goals")
            .select("goal_amount")
            .eq("user_id", user.id)
            .eq("month", month)
            .eq("year", year)
            .maybeSingle(),
          supabase
            .from("profiles")
            .select("contract_type")
            .eq("id", user.id)
            .single()
        ]);
        
        if (salesResult.error) {
          console.error(`Error fetching sales for ${user.name}:`, salesResult.error);
          toast({
            title: "Erro ao carregar vendas",
            description: "Não foi possível carregar os dados de vendas.",
            variant: "destructive",
          });
          return;
        }
        
        const salesData = salesResult.data || [];
        const goalData = goalResult.data;
        const profileData = profileResult.data;
          
        const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.gross_amount), 0);
        const salesCount = salesData.length;
        const goalAmount = goalData?.goal_amount ? Number(goalData.goal_amount) : 0;
        const contractType = profileData?.contract_type || 'PJ';
        
        const commission = calculateCommission(totalSales, contractType);
        const projectedCommission = commission.amount;
        
        const dailyTarget = goalAmount / totalBusinessDays;
        const expectedProgress = dailyTarget * businessDaysElapsed;
        const metaGap = totalSales - expectedProgress;
        
        const goalPercentage = expectedProgress > 0 ? (totalSales / expectedProgress) * 100 : 0;
        
        const remainingAmount = goalAmount - totalSales;
        const remainingDailyTarget = businessDaysRemaining > 0 ? remainingAmount / businessDaysRemaining : 0;
        
        // Calculate zero days count more efficiently
        const salesDates = new Set(salesData.map(sale => sale.sale_date));
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
          contractType,
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
  }, [selectedMonth, user?.id, toast, user?.name]);
  
  function getAllBusinessDaysInMonth(month: number, year: number): string[] {
    const result: string[] = [];
    const lastDay = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day);
      
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
