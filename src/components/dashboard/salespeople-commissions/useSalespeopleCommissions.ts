
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalespersonCommission, SortColumn, SortDirection, SummaryTotals } from "./types";
import { getBusinessDaysInMonth, getBusinessDaysElapsedUntilToday } from "./utils";
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from "@/lib/constants";
import { format, isWeekend } from "date-fns";

export function useSalespeopleCommissions() {
  const [salespeople, setSalespeople] = useState<SalespersonCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();
  
  // Function to sort salespeople based on column and direction
  const sortSalespeople = (
    data: SalespersonCommission[], 
    column: SortColumn, 
    direction: SortDirection
  ) => {
    const sortedData = [...data].sort((a, b) => {
      if (column === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      const aValue = a[column];
      const bValue = b[column];
      
      if (direction === 'asc') {
        return (aValue as number) - (bValue as number);
      } else {
        return (bValue as number) - (aValue as number);
      }
    });
    
    setSalespeople(sortedData);
  };
  
  // Handle header click for sorting
  const handleSort = (column: SortColumn) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    sortSalespeople(salespeople, column, newDirection);
  };

  useEffect(() => {
    const fetchSalespeopleCommissions = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const totalBusinessDays = getBusinessDaysInMonth(currentMonth, currentYear);
        const businessDaysElapsed = getBusinessDaysElapsedUntilToday();
        const businessDaysRemaining = totalBusinessDays - businessDaysElapsed;
        
        console.log("Fetching salespeople profiles...");
        
        // Fetch all profiles with role 'vendedor'
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
          setLoading(false);
          return;
        }
        
        console.log("Found profiles:", profilesData?.length || 0);
        
        if (!profilesData || profilesData.length === 0) {
          console.log("No salespeople found");
          setSalespeople([]);
          setLoading(false);
          return;
        }
        
        // Get all business days of the current month up to today
        const allBusinessDays = getAllBusinessDaysUntilToday(currentMonth, currentYear);
        console.log("Business days until today:", allBusinessDays.length);
        
        const commissionData = await Promise.all(
          profilesData.map(async (profile) => {
            try {
              const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
              const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
              
              console.log(`Fetching sales for ${profile.name} from ${startDate} to ${endDate}`);
              
              // Fetch sales data for this salesperson
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
              
              console.log(`Found ${salesData?.length || 0} sales for ${profile.name}`);
              
              // Fetch monthly goal
              const { data: goalData, error: goalError } = await supabase
                .from("monthly_goals")
                .select("goal_amount")
                .eq("user_id", profile.id)
                .eq("month", currentMonth)
                .eq("year", currentYear)
                .maybeSingle();
                
              if (goalError) {
                console.error(`Error fetching goal for ${profile.name}:`, goalError);
              }
              
              const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.gross_amount || 0), 0) || 0;
              const salesCount = salesData?.length || 0;
              const goalAmount = goalData?.goal_amount ? Number(goalData.goal_amount) : 0;
              
              console.log(`${profile.name}: ${salesCount} sales, R$ ${totalSales}, goal R$ ${goalAmount}`);
              
              // For commission calculation, we use the FIXED COMMISSION GOAL AMOUNT
              const commissionRate = totalSales >= COMMISSION_GOAL_AMOUNT 
                ? COMMISSION_RATE_ABOVE_GOAL 
                : COMMISSION_RATE_BELOW_GOAL;
                
              const projectedCommission = totalSales * commissionRate;
              
              const dailyTarget = goalAmount / totalBusinessDays;
              const expectedProgress = dailyTarget * businessDaysElapsed;
              const metaGap = totalSales - expectedProgress;
              
              // Goal percentage is calculated based on the personal goal, not commission goal
              const goalPercentage = expectedProgress > 0 ? (totalSales / expectedProgress) * 100 : 0;
              
              const remainingAmount = goalAmount - totalSales;
              const remainingDailyTarget = businessDaysRemaining > 0 ? remainingAmount / businessDaysRemaining : 0;
              
              // Calculate zero days count - days when the salesperson had no sales
              const salesDates = new Set(
                salesData?.map(sale => sale.sale_date) || []
              );
              
              // Count business days with zero sales
              const zeroDaysCount = allBusinessDays.filter(day => !salesDates.has(day)).length;
              
              return {
                id: profile.id,
                name: profile.name || "Sem nome",
                totalSales,
                goalAmount,
                commissionGoalAmount: COMMISSION_GOAL_AMOUNT, // Fixed commission goal
                projectedCommission,
                goalPercentage,
                salesCount,
                metaGap,
                expectedProgress,
                remainingDailyTarget: Math.max(0, remainingDailyTarget),
                zeroDaysCount, // New field for days with zero sales
              };
            } catch (error) {
              console.error(`Error processing data for ${profile.name}:`, error);
              return null;
            }
          })
        );
        
        const validCommissions = commissionData.filter(Boolean) as SalespersonCommission[];
        console.log("Valid commissions:", validCommissions.length);
        
        // Apply initial sort
        sortSalespeople(validCommissions, sortColumn, sortDirection);
      } catch (error) {
        console.error("Error fetching salespeople commissions:", error);
        toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível carregar os dados de comissões.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalespeopleCommissions();
  }, []);
  
  // Get all business days of the current month until today
  function getAllBusinessDaysUntilToday(month: number, year: number): string[] {
    const result: string[] = [];
    const today = new Date();
    const lastDay = today.getDate();
    
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month - 1, day);
      if (date > today) break; // Don't include future days
      
      // Skip weekends
      if (!isWeekend(date)) {
        // Format as YYYY-MM-DD to match database format
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
    zeroDaysCount: 0, // Not applicable for summary row
  };
  
  return {
    salespeople,
    summaryTotals,
    loading,
    sortColumn,
    sortDirection,
    handleSort
  };
}
