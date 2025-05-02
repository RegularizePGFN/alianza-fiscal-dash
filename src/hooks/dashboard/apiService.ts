
import { supabase } from "@/integrations/supabase/client";
import { Sale, SalesSummary, UserRole } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { convertToPaymentMethod } from "@/lib/utils";
import { DashboardTrends } from "./types";

export const fetchSalesData = async (
  user: { id: string; role: UserRole } | null,
  currentStartStr: string,
  currentEndStr: string
) => {
  if (!user) return [];

  // Fetch current month sales
  const { data: salesData, error } = await supabase
    .from("sales")
    .select("*")
    .gte("sale_date", currentStartStr)
    .lte("sale_date", currentEndStr)
    .order("sale_date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }

  console.log("Dados recebidos do Supabase (mês atual):", salesData?.length || 0, "registros");

  // Filter data client-side if needed
  let filteredCurrentData = salesData || [];
  if (user.role === UserRole.SALESPERSON) {
    filteredCurrentData = filteredCurrentData.filter((sale) => sale.salesperson_id === user.id);
    console.log("Dados filtrados para vendedor (mês atual):", filteredCurrentData.length, "registros");
  }

  // Map data to Sale interface
  const formattedSales: Sale[] = filteredCurrentData.map((sale) => ({
    id: sale.id,
    salesperson_id: sale.salesperson_id,
    salesperson_name: sale.salesperson_name || "Sem nome",
    gross_amount: sale.gross_amount,
    net_amount: sale.gross_amount, // Using gross_amount as net_amount
    payment_method: convertToPaymentMethod(sale.payment_method),
    installments: sale.installments || 1,
    sale_date: sale.sale_date,
    created_at: sale.created_at,
    client_name: sale.client_name || "Cliente não identificado",
    client_phone: sale.client_phone || "",
    client_document: sale.client_document || "",
  }));

  return formattedSales;
};

export const fetchPreviousMonthSales = async (
  user: { id: string; role: UserRole } | null,
  prevStartStr: string,
  prevEndStr: string
) => {
  if (!user) return [];

  const { data: prevMonthData, error: prevMonthError } = await supabase
    .from("sales")
    .select("*")
    .gte("sale_date", prevStartStr)
    .lte("sale_date", prevEndStr);

  if (prevMonthError) {
    console.error("Erro ao buscar dados do mês anterior:", prevMonthError);
    throw prevMonthError;
  }

  console.log("Dados recebidos do Supabase (mês anterior):", prevMonthData?.length || 0, "registros");

  let filteredPrevData = prevMonthData || [];
  if (user.role === UserRole.SALESPERSON) {
    filteredPrevData = filteredPrevData.filter((sale) => sale.salesperson_id === user.id);
    console.log("Dados filtrados para vendedor (mês anterior):", filteredPrevData.length, "registros");
  }

  return filteredPrevData;
};

export const fetchMonthlyGoal = async (
  user: { id: string; role: UserRole } | null,
  currentMonth: number,
  currentYear: number
) => {
  if (!user) return DEFAULT_GOAL_AMOUNT;

  try {
    // For admin users, we need to sum all users' goals or count salespeople
    if (user.role === UserRole.ADMIN) {
      // First check if there are explicitly set goals for salespeople
      const { data: goalsData, error: goalsError } = await supabase
        .from("monthly_goals")
        .select("goal_amount")
        .eq("month", currentMonth)
        .eq("year", currentYear);
        
      if (goalsError) {
        console.error("Erro ao buscar metas:", goalsError);
        // If we can't get the goals, let's count salespeople as a fallback
      } else if (goalsData && goalsData.length > 0) {
        // Sum all explicitly set goals
        const totalGoal = goalsData.reduce((sum, goal) => sum + (goal.goal_amount || 0), 0);
        console.log(`Meta total para admins (soma de ${goalsData.length} metas explícitas):`, totalGoal);
        return totalGoal > 0 ? totalGoal : DEFAULT_GOAL_AMOUNT;
      }
      
      // If no explicit goals are found, count salespeople and multiply by default goal
      const { data: salespeople, error: countError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", UserRole.SALESPERSON);
      
      if (countError) {
        console.error("Erro ao contar vendedores:", countError);
        return DEFAULT_GOAL_AMOUNT;
      }
      
      if (salespeople && salespeople.length > 0) {
        const totalGoal = salespeople.length * DEFAULT_GOAL_AMOUNT;
        console.log(`Meta total para admins (baseada em ${salespeople.length} vendedores):`, totalGoal);
        return totalGoal;
      }
      
      return DEFAULT_GOAL_AMOUNT;
    } 
    // For non-admin users, just get their specific goal
    else {
      const { data: goalData, error: goalError } = await supabase
        .from("monthly_goals")
        .select("goal_amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("user_id", user.id)
        .maybeSingle();

      if (goalError) {
        console.error("Erro ao buscar meta:", goalError);
        return DEFAULT_GOAL_AMOUNT;
      }

      if (goalData && goalData.goal_amount) {
        console.log("Meta mensal encontrada:", goalData.goal_amount);
        return goalData.goal_amount;
      }
    }

    console.log("Nenhuma meta encontrada, usando valor padrão:", DEFAULT_GOAL_AMOUNT);
    return DEFAULT_GOAL_AMOUNT;
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return DEFAULT_GOAL_AMOUNT;
  }
};

export const calculateSalesSummary = (
  sales: Sale[],
  monthlyGoal: number
): { summary: SalesSummary; trends: DashboardTrends } => {
  const totalAmount = sales.reduce((sum, sale) => sum + sale.gross_amount, 0);

  // Commission rate depends on whether the goal was met
  const commissionRate = totalAmount >= monthlyGoal ? 0.25 : 0.2;
  const projectedCommission = totalAmount * commissionRate;

  // Calculate trend percentages
  let totalSalesTrend = { value: 0, isPositive: true };
  let averageSaleTrend = { value: 0, isPositive: true };

  return {
    summary: {
      total_sales: sales.length,
      total_gross: totalAmount,
      total_net: totalAmount, // Keeping this to avoid breaking changes
      projected_commission: projectedCommission,
      goal_amount: monthlyGoal,
      goal_percentage: Math.min(totalAmount / monthlyGoal, 2),
    },
    trends: {
      totalSalesTrend,
      averageSaleTrend,
    },
  };
};
