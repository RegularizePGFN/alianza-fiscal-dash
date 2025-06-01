import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Sale, SalesSummary } from "@/lib/types";
import { getCurrentMonthDates } from "@/lib/utils";
import { fetchSalesData, fetchPreviousMonthSales, fetchMonthlyGoal, calculateSalesSummary } from "./dashboard";
import { DashboardTrends } from "./dashboard/types";

export const useDashboardData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary>({
    total_sales: 0,
    total_gross: 0,
    total_net: 0,
    projected_commission: 0,
    goal_amount: 0,
    goal_percentage: 0,
  });
  const [trends, setTrends] = useState<DashboardTrends>({
    totalSalesTrend: { value: 0, isPositive: true },
    averageSaleTrend: { value: 0, isPositive: true },
  });

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      console.log("=== DASHBOARD DATA FETCH DEBUG ===");
      console.log("Fetching dashboard data for user:", user.name, "Role:", user.role);
      
      // Get current month dates
      const { start: currentMonthStart, end: currentMonthEnd } = getCurrentMonthDates();
      
      // Calculate previous month dates
      const prevMonthStart = new Date(currentMonthStart);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
      const prevMonthEnd = new Date(currentMonthStart);
      prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
      
      // Format dates for Supabase queries
      const currentStartStr = currentMonthStart.toISOString().split('T')[0];
      const currentEndStr = currentMonthEnd.toISOString().split('T')[0];
      const prevStartStr = prevMonthStart.toISOString().split('T')[0];
      const prevEndStr = prevMonthEnd.toISOString().split('T')[0];
      
      console.log("Current month period:", currentStartStr, "to", currentEndStr);
      console.log("Previous month period:", prevStartStr, "to", prevEndStr);
      
      // Fetch sales data
      const formattedSales = await fetchSalesData(user, currentStartStr, currentEndStr);
      console.log("Sales data fetched:", formattedSales.length, "sales");
      
      // Fetch previous month sales for comparison
      const prevMonthSales = await fetchPreviousMonthSales(user, prevStartStr, prevEndStr);
      console.log("Previous month sales fetched:", prevMonthSales.length, "sales");
      
      // Get monthly goal - ensure we're using the CURRENT month and year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JS (junho = 6)
      const currentYear = currentDate.getFullYear();
      
      console.log("Fetching goal for month:", currentMonth, "year:", currentYear);
      console.log("Today's date:", currentDate.toLocaleDateString('pt-BR'));
      
      const monthlyGoal = await fetchMonthlyGoal(user, currentMonth, currentYear);
      console.log("Monthly goal fetched:", monthlyGoal);
      
      // Calculate summary and trends
      if (formattedSales.length > 0) {
        // Use the current sales data, previous month data and goal to calculate summary
        const result = calculateSalesSummary(formattedSales, monthlyGoal);
        
        // Update states with calculated data
        setSalesData(formattedSales);
        setSummary(result.summary);
        setTrends(result.trends);
        
        console.log("Summary calculated:", result.summary);
        console.log("Goal percentage:", ((result.summary.total_net / monthlyGoal) * 100).toFixed(1) + "%");
      } else {
        console.log("No sales found for current period");
        // Set empty data but keep the goal
        setSalesData([]);
        setSummary({
          total_sales: 0,
          total_gross: 0,
          total_net: 0,
          projected_commission: 0,
          goal_amount: monthlyGoal,
          goal_percentage: 0,
        });
        setTrends({
          totalSalesTrend: { value: 0, isPositive: true },
          averageSaleTrend: { value: 0, isPositive: true }
        });
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      console.log("User authenticated, fetching dashboard data");
      fetchDashboardData();
    } else {
      console.log("No authenticated user, skipping dashboard data fetch");
    }
  }, [user?.id, user?.role]); // Only depend on essential user properties
  
  return {
    salesData,
    summary,
    trends,
    loading,
    fetchDashboardData
  };
};
