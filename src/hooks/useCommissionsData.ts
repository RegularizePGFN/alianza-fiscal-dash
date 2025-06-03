
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateCommission } from "@/lib/utils";
import { SalespersonCommission, SummaryTotals } from "@/components/dashboard/salespeople-commissions/types";

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
        
        // Parse selected month
        const [year, month] = selectedMonth.split('-').map(Number);
        
        console.log('Fetching commission data for:', { year, month });
        
        // Get all salespeople profiles
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
        
        const commissionData = await Promise.all(
          profilesData.map(async (profile) => {
            // Get sales for the selected month
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
            
            // Get monthly goal for the selected period
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
            
            // Get contract type from profile, default to PJ
            const contractType = profile.contract_type || 'PJ';
            
            // Calculate commission using the unified function
            const commission = calculateCommission(totalSales, contractType);
            
            console.log(`Commission calculated for ${profile.name} (${selectedMonth}):`, {
              totalSales,
              contractType,
              commissionAmount: commission.amount,
              commissionRate: commission.rate
            });
            
            const goalPercentage = goalAmount > 0 ? (totalSales / goalAmount) * 100 : 0;
            
            return {
              id: profile.id,
              name: profile.name || "Sem nome",
              totalSales,
              goalAmount,
              commissionGoalAmount: 10000, // Fixed commission goal
              projectedCommission: commission.amount,
              goalPercentage,
              salesCount,
              metaGap: totalSales - goalAmount,
              expectedProgress: goalAmount, // For historical data, we use the full goal
              remainingDailyTarget: 0, // Not applicable for historical data
              zeroDaysCount: 0, // Not calculated for historical data
            };
          })
        );
        
        const validCommissions = commissionData.filter(Boolean) as SalespersonCommission[];
        setSalespeople(validCommissions);
        
        console.log('Historical commission data loaded:', validCommissions);
        console.log('Total commissions for period:', validCommissions.reduce((total, c) => total + c.projectedCommission, 0));
        
      } catch (error) {
        console.error("Error fetching commission data:", error);
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
  }, [selectedMonth]);
  
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
    zeroDaysCount: 0, // Not applicable for summary row
  };
  
  return {
    salespeople,
    summaryTotals,
    loading
  };
}
