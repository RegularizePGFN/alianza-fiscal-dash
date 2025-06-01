
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { SalespersonCommissionData, SummaryTotals } from "./types";
import { calculateCommissionRate, calculateCommission } from "./utils";

type SortColumn = 'name' | 'totalSales' | 'grossValue' | 'netValue' | 'commission' | 'goal' | 'goalProgress';
type SortDirection = 'asc' | 'desc';

export const useSalespeopleCommissions = (selectedMonth?: number, selectedYear?: number) => {
  const { user } = useAuth();
  const [salespeople, setSalespeople] = useState<SalespersonCommissionData[]>([]);
  const [summaryTotals, setSummaryTotals] = useState<SummaryTotals>({
    totalSales: 0,
    totalGross: 0,
    totalNet: 0,
    totalCommission: 0,
    totalGoal: 0,
    averageGoalProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>('commission');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchSalespeopleCommissions = async () => {
    if (!user || user.role !== UserRole.ADMIN) return;
    
    setLoading(true);
    
    try {
      console.log("=== SALESPEOPLE COMMISSIONS FETCH DEBUG ===");
      
      // Determine date range
      let startDate: string;
      let endDate: string;
      
      if (selectedMonth && selectedYear) {
        // Use selected month/year
        startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
        endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        console.log("Using selected period:", startDate, "to", endDate);
      } else {
        // Use current month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        console.log("Using current month period:", startDate, "to", endDate);
      }
      
      // Get all vendedor profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "vendedor");
      
      if (profilesError) throw profilesError;
      
      console.log("Vendedor profiles found:", profiles?.length || 0);
      
      if (!profiles || profiles.length === 0) {
        setSalespeople([]);
        return;
      }
      
      // Get sales for the period
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .gte('sale_date', startDate)
        .lt('sale_date', endDate);
      
      if (salesError) throw salesError;
      
      console.log("Sales data fetched:", sales?.length || 0, "sales");
      
      // Get goals for the period
      const goalMonth = selectedMonth || new Date().getMonth() + 1;
      const goalYear = selectedYear || new Date().getFullYear();
      
      const { data: goals, error: goalsError } = await supabase
        .from("monthly_goals")
        .select("*")
        .eq("month", goalMonth)
        .eq("year", goalYear)
        .in("user_id", profiles.map(p => p.id));
      
      if (goalsError) throw goalsError;
      
      console.log("Goals data fetched:", goals?.length || 0, "goals");
      
      // Process data for each salesperson
      const salespeopleData: SalespersonCommissionData[] = profiles.map(profile => {
        const personSales = sales?.filter(sale => sale.salesperson_id === profile.id) || [];
        const personGoal = goals?.find(goal => goal.user_id === profile.id);
        
        const totalSales = personSales.length;
        const grossValue = personSales.reduce((sum, sale) => sum + Number(sale.gross_amount), 0);
        const netValue = grossValue; // Using gross as net for now
        
        // Calculate commission using the same logic
        const commission = personSales.reduce((sum, sale) => {
          const saleGross = Number(sale.gross_amount);
          const rate = calculateCommissionRate(saleGross);
          return sum + calculateCommission(saleGross, rate);
        }, 0);
        
        const goalAmount = personGoal ? Number(personGoal.goal_amount) : 0;
        const goalProgress = goalAmount > 0 ? (netValue / goalAmount) * 100 : 0;
        
        return {
          id: profile.id,
          name: profile.name,
          totalSales,
          grossValue,
          netValue,
          commission,
          goal: goalAmount,
          goalProgress
        };
      });
      
      // Calculate summary totals
      const totals: SummaryTotals = {
        totalSales: salespeopleData.reduce((sum, person) => sum + person.totalSales, 0),
        totalGross: salespeopleData.reduce((sum, person) => sum + person.grossValue, 0),
        totalNet: salespeopleData.reduce((sum, person) => sum + person.netValue, 0),
        totalCommission: salespeopleData.reduce((sum, person) => sum + person.commission, 0),
        totalGoal: salespeopleData.reduce((sum, person) => sum + person.goal, 0),
        averageGoalProgress: salespeopleData.length > 0 
          ? salespeopleData.reduce((sum, person) => sum + person.goalProgress, 0) / salespeopleData.length 
          : 0
      };
      
      setSalespeople(salespeopleData);
      setSummaryTotals(totals);
      
      console.log("Summary totals:", totals);
    } catch (error) {
      console.error("Error fetching salespeople commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Sort the data
  const sortedSalespeople = [...salespeople].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortColumn) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'totalSales':
        return multiplier * (a.totalSales - b.totalSales);
      case 'grossValue':
        return multiplier * (a.grossValue - b.grossValue);
      case 'netValue':
        return multiplier * (a.netValue - b.netValue);
      case 'commission':
        return multiplier * (a.commission - b.commission);
      case 'goal':
        return multiplier * (a.goal - b.goal);
      case 'goalProgress':
        return multiplier * (a.goalProgress - b.goalProgress);
      default:
        return 0;
    }
  });

  useEffect(() => {
    fetchSalespeopleCommissions();
  }, [user, selectedMonth, selectedYear]);

  return {
    salespeople: sortedSalespeople,
    summaryTotals,
    loading,
    sortColumn,
    sortDirection,
    handleSort
  };
};
