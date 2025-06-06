
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
      console.log("🔄 Iniciando busca de dados do dashboard para:", user.name, `(${user.role})`);
      
      // Get current month dates - using the actual current date
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = now.getFullYear();
      
      console.log(`📅 Mês atual: ${currentMonth}/${currentYear}`);
      
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
      
      console.log("📊 Período atual:", currentStartStr, "até", currentEndStr);
      console.log("📊 Período anterior:", prevStartStr, "até", prevEndStr);
      
      // Fetch sales data
      const formattedSales = await fetchSalesData(user, currentStartStr, currentEndStr);
      
      console.log("🔍 DEBUG DASHBOARD - Total de vendas carregadas:", formattedSales.length);
      console.log("🔍 DEBUG DASHBOARD - Vendas por vendedor:", 
        formattedSales.reduce((acc, sale) => {
          const name = sale.salesperson_name;
          if (!acc[name]) acc[name] = { count: 0, total: 0 };
          acc[name].count++;
          acc[name].total += sale.gross_amount || 0;
          return acc;
        }, {} as Record<string, { count: number; total: number }>)
      );
      
      const totalDashboard = formattedSales.reduce((sum, sale) => sum + (sale.gross_amount || 0), 0);
      console.log("💰 DEBUG DASHBOARD - Total geral das vendas:", totalDashboard);
      
      // Fetch previous month sales for comparison
      const prevMonthSales = await fetchPreviousMonthSales(user, prevStartStr, prevEndStr);
      
      // Get monthly goal with correct current month/year
      console.log(`🎯 Buscando meta mensal para ${currentMonth}/${currentYear}`);
      const monthlyGoal = await fetchMonthlyGoal(user, currentMonth, currentYear);
      console.log(`🎯 Meta obtida: R$ ${monthlyGoal}`);
      
      // Calculate summary and trends
      if (formattedSales.length > 0) {
        // Use the current sales data, previous month data and goal to calculate summary
        const result = calculateSalesSummary(formattedSales, monthlyGoal);
        
        console.log("💰 DEBUG DASHBOARD - Resumo total_gross:", result.summary.total_gross);
        
        // Update states with calculated data
        setSalesData(formattedSales);
        setSummary(result.summary);
        setTrends(result.trends);
        
        console.log("✅ Resumo calculado:", result.summary);
      } else {
        console.log("⚠️ Nenhuma venda encontrada para o período");
        // Set empty data
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
      console.error("❌ Erro ao buscar dados:", error);
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
      console.log("👤 Usuário autenticado, buscando dados de vendas");
      fetchDashboardData();
    } else {
      console.log("❌ Nenhum usuário autenticado, pulando busca de vendas");
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
