
import { useState, useEffect, useCallback } from "react";
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

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("🔄 Iniciando busca de dados do dashboard para:", user.name, `(${user.role})`);
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      console.log(`📅 Mês atual: ${currentMonth}/${currentYear}`);
      
      const { start: currentMonthStart, end: currentMonthEnd } = getCurrentMonthDates();
      
      const prevMonthStart = new Date(currentMonthStart);
      prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
      const prevMonthEnd = new Date(currentMonthStart);
      prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
      
      const currentStartStr = currentMonthStart.toISOString().split('T')[0];
      const currentEndStr = currentMonthEnd.toISOString().split('T')[0];
      const prevStartStr = prevMonthStart.toISOString().split('T')[0];
      const prevEndStr = prevMonthEnd.toISOString().split('T')[0];
      
      console.log("📊 Período atual:", currentStartStr, "até", currentEndStr);
      
      const [formattedSales, prevMonthSales, monthlyGoal] = await Promise.all([
        fetchSalesData(user, currentStartStr, currentEndStr),
        fetchPreviousMonthSales(user, prevStartStr, prevEndStr),
        fetchMonthlyGoal(user, currentMonth, currentYear)
      ]);
      
      console.log(`🎯 Meta obtida: R$ ${monthlyGoal}`);
      
      if (formattedSales.length > 0) {
        const result = calculateSalesSummary(formattedSales, monthlyGoal);
        
        setSalesData(formattedSales);
        setSummary(result.summary);
        setTrends(result.trends);
        
        console.log("✅ Resumo calculado:", result.summary);
      } else {
        console.log("⚠️ Nenhuma venda encontrada para o período");
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
  }, [user?.id, user?.role, toast]);
  
  useEffect(() => {
    if (user?.id) {
      console.log("👤 Usuário autenticado, buscando dados de vendas");
      fetchDashboardData();
    } else {
      console.log("❌ Nenhum usuário autenticado, pulando busca de vendas");
      setLoading(false);
    }
  }, [user?.id, fetchDashboardData]);
  
  return {
    salesData,
    summary,
    trends,
    loading,
    fetchDashboardData
  };
};
