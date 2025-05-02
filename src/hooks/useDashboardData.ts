
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sale, SalesSummary, UserRole, PaymentMethod } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { getCurrentMonthDates } from "@/lib/utils";

// Helper function to convert string to PaymentMethod enum
const convertToPaymentMethod = (method: string): PaymentMethod => {
  switch (method) {
    case "Boleto":
      return PaymentMethod.BOLETO;
    case "Pix":
      return PaymentMethod.PIX;
    case "Crédito":
      return PaymentMethod.CREDIT;
    case "Débito":
      return PaymentMethod.DEBIT;
    default:
      return PaymentMethod.CREDIT; // Default value
  }
};

export interface DashboardTrends {
  totalSalesTrend: { value: number; isPositive: boolean };
  averageSaleTrend: { value: number; isPositive: boolean };
}

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
      
      // Fetch current month sales
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', currentStartStr)
        .lte('sale_date', currentEndStr)
        .order('sale_date', { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar dados:", error);
        throw error;
      }
      
      // Fetch previous month sales for trend calculation
      const { data: prevMonthData, error: prevMonthError } = await supabase
        .from('sales')
        .select('*')
        .gte('sale_date', prevStartStr)
        .lte('sale_date', prevEndStr);
      
      if (prevMonthError) {
        console.error("Erro ao buscar dados do mês anterior:", prevMonthError);
        throw prevMonthError;
      }
      
      console.log("Dados recebidos do Supabase (mês atual):", salesData?.length || 0, "registros");
      console.log("Dados recebidos do Supabase (mês anterior):", prevMonthData?.length || 0, "registros");
      
      // Filtramos no lado do cliente apenas se necessário
      let filteredCurrentData = salesData || [];
      let filteredPrevData = prevMonthData || [];
      
      if (user.role === UserRole.SALESPERSON) {
        filteredCurrentData = filteredCurrentData.filter(sale => sale.salesperson_id === user.id);
        filteredPrevData = filteredPrevData.filter(sale => sale.salesperson_id === user.id);
        console.log("Dados filtrados para vendedor (mês atual):", filteredCurrentData.length, "registros");
        console.log("Dados filtrados para vendedor (mês anterior):", filteredPrevData.length, "registros");
      }
      
      // Buscar meta do usuário ou do time
      let monthlyGoal = DEFAULT_GOAL_AMOUNT;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Meses são 0-indexados em JS
      const currentYear = currentDate.getFullYear();
      
      // Modified query to handle multiple goals - we'll just use the first one or highest value
      const { data: goalData, error: goalError } = await supabase
        .from('monthly_goals')
        .select('goal_amount')
        .eq('month', currentMonth)
        .eq('year', currentYear);
      
      if (goalData && goalData.length > 0 && !goalError) {
        // If multiple goals are found, we'll use the highest one
        const highestGoal = goalData.reduce((max, goal) => 
          goal.goal_amount > max ? goal.goal_amount : max, 
          goalData[0].goal_amount
        );
        monthlyGoal = highestGoal;
        console.log("Meta mensal encontrada:", monthlyGoal, "(de", goalData.length, "registros)");
      } else if (goalError && goalError.code !== 'PGRST116') {
        console.error('Erro ao buscar meta:', goalError);
      } else {
        console.log("Nenhuma meta encontrada, usando valor padrão:", DEFAULT_GOAL_AMOUNT);
      }
      
      // Calculate trend percentages
      let totalSalesTrend = { value: 0, isPositive: true };
      let averageSaleTrend = { value: 0, isPositive: true };
      
      const currentTotalAmount = filteredCurrentData.reduce((sum, sale) => sum + sale.gross_amount, 0);
      const prevTotalAmount = filteredPrevData.reduce((sum, sale) => sum + sale.gross_amount, 0);
      
      const currentAvgAmount = filteredCurrentData.length > 0 
        ? currentTotalAmount / filteredCurrentData.length 
        : 0;
        
      const prevAvgAmount = filteredPrevData.length > 0 
        ? prevTotalAmount / filteredPrevData.length 
        : 0;
      
      // Calculate percentage changes
      if (prevTotalAmount > 0) {
        const totalChange = ((currentTotalAmount - prevTotalAmount) / prevTotalAmount) * 100;
        totalSalesTrend = {
          value: Math.abs(Math.round(totalChange)),
          isPositive: totalChange >= 0
        };
      }
      
      if (prevAvgAmount > 0) {
        const avgChange = ((currentAvgAmount - prevAvgAmount) / prevAvgAmount) * 100;
        averageSaleTrend = {
          value: Math.abs(Math.round(avgChange)),
          isPositive: avgChange >= 0
        };
      }
      
      console.log("Trend calculations:", {
        totalSalesTrend,
        averageSaleTrend
      });
      
      if (filteredCurrentData.length > 0) {
        // Mapear os dados do Supabase para o formato da interface Sale
        const formattedSales: Sale[] = filteredCurrentData.map(sale => ({
          id: sale.id,
          salesperson_id: sale.salesperson_id,
          salesperson_name: sale.salesperson_name || "Sem nome",
          gross_amount: sale.gross_amount,
          net_amount: sale.gross_amount, // Usamos o gross_amount como net_amount
          payment_method: convertToPaymentMethod(sale.payment_method), // Convertendo string para enum
          installments: sale.installments || 1,
          sale_date: sale.sale_date,
          created_at: sale.created_at,
          client_name: sale.client_name || "Cliente não identificado",
          client_phone: sale.client_phone || "",
          client_document: sale.client_document || ""
        }));
        
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
        
        setTrends({
          totalSalesTrend,
          averageSaleTrend
        });
        
        console.log("Resumo calculado:", {
          total_sales: formattedSales.length,
          total_gross: totalAmount,
          goal_amount: monthlyGoal,
          goal_percentage: Math.min(totalAmount / monthlyGoal, 2),
          trends: { totalSalesTrend, averageSaleTrend }
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
