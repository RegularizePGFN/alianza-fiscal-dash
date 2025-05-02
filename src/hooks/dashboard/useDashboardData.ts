
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Sale, SalesSummary } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { getCurrentMonthDates } from "@/lib/utils";
import { DashboardTrends, UseDashboardDataReturn } from "./types";
import { calculateTrends, formatSalesData } from "./utils";
import { fetchMonthlySalesData, fetchPreviousMonthSalesData, fetchMonthlyGoal } from "./apiService";

export const useDashboardData = (): UseDashboardDataReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary>({
    total_sales: 0,
    total_gross: 0,
    total_net: 0,
    projected_commission: 0,
    goal_amount: DEFAULT_GOAL_AMOUNT,
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
      console.log("Buscando dados de vendas para", user.name);
      
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
      
      // Fetch data for current and previous month
      const filteredCurrentData = await fetchMonthlySalesData(currentStartStr, currentEndStr, user);
      const filteredPrevData = await fetchPreviousMonthSalesData(prevStartStr, prevEndStr, user);
      
      console.log("Dados recebidos do Supabase (mês atual):", filteredCurrentData.length, "registros");
      console.log("Dados recebidos do Supabase (mês anterior):", filteredPrevData.length, "registros");
      
      // Buscar meta do usuário ou do time
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Meses são 0-indexados em JS
      const currentYear = currentDate.getFullYear();
      const monthlyGoal = await fetchMonthlyGoal(currentMonth, currentYear);
      
      // Calculate trends
      const calculatedTrends = calculateTrends(filteredCurrentData, filteredPrevData);
      
      if (filteredCurrentData.length > 0) {
        // Format the sales data
        const formattedSales = formatSalesData(filteredCurrentData);
        
        setSalesData(formattedSales);
        console.log("Dados formatados e definidos no estado:", formattedSales.length, "vendas");
        
        // Calcular resumo
        const totalAmount = formattedSales.reduce((sum, sale) => sum + sale.gross_amount, 0);
        
        // Taxa de comissão depende se a meta foi atingida
        const commissionRate = totalAmount >= monthlyGoal ? 0.25 : 0.2;
        const projectedCommission = totalAmount * commissionRate;
        
        setSummary({
          total_sales: formattedSales.length,
          total_gross: totalAmount,
          total_net: totalAmount,  // Mantendo isso para evitar quebrar alterações
          projected_commission: projectedCommission,
          goal_amount: monthlyGoal,
          goal_percentage: Math.min(totalAmount / monthlyGoal, 2),
        });
        
        setTrends(calculatedTrends);
        
        console.log("Resumo calculado:", {
          total_sales: formattedSales.length,
          total_gross: totalAmount,
          goal_amount: monthlyGoal,
          goal_percentage: Math.min(totalAmount / monthlyGoal, 2),
          trends: calculatedTrends
        });
      } else {
        console.log("Nenhuma venda encontrada");
        // Definir dados vazios
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
      console.error("Erro ao buscar dados:", error);
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
      console.log("Authenticated user, fetching sales");
      fetchDashboardData();
    } else {
      console.log("No authenticated user, skipping sales fetch");
    }
  }, [user]);
  
  return {
    salesData,
    summary,
    trends,
    loading,
    fetchDashboardData
  };
};
