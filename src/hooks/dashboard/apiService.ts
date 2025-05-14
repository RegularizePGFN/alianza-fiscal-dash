import { Sale, SalesSummary } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentMonthDates } from "@/lib/utils";

export async function fetchSalesData(user: any, startDate: string, endDate: string): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("salesperson_id", user.id)
    .gte("sale_date", startDate)
    .lte("sale_date", endDate);

  if (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }

  return data || [];
}

export async function fetchPreviousMonthSales(user: any, startDate: string, endDate: string): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("salesperson_id", user.id)
    .gte("sale_date", startDate)
    .lte("sale_date", endDate);

  if (error) {
    console.error("Error fetching previous month sales data:", error);
    return [];
  }

  return data || [];
}

export async function fetchMonthlyGoal(user: any, month: number, year: number): Promise<number> {
  try {
    if (!user) return 0;

    const { data: goalData, error: goalError } = await supabase
      .from('monthly_goals')
      .select('goal_amount')
      .eq('user_id', user.id)
      .eq('month', month.toString()) // Convert to string
      .eq('year', year.toString()) // Convert to string
      .maybeSingle();

    if (goalError) {
      console.error("Error fetching monthly goal:", goalError);
      return 0;
    }

    return goalData?.goal_amount ? parseFloat(goalData.goal_amount) : 0;
  } catch (error) {
    console.error("Error in fetchMonthlyGoal:", error);
    return 0;
  }
}

export async function calculateSalesSummary(sales: Sale[], monthlyGoal: number): Promise<{ summary: SalesSummary; trends: any }> {
  const totalSales = sales.length;
  const totalGross = sales.reduce((sum, sale) => sum + parseFloat(sale.gross_amount), 0);
  const totalNet = sales.reduce((sum, sale) => sum + parseFloat(sale.net_amount), 0);
  const projectedCommission = totalGross * 0.2; // Example commission calculation

  const goalPercentage = monthlyGoal > 0 ? (totalGross / monthlyGoal) * 100 : 0;

  const summary: SalesSummary = {
    total_sales: totalSales,
    total_gross: totalGross,
    total_net: totalNet,
    projected_commission: projectedCommission,
    goal_amount: monthlyGoal,
    goal_percentage: goalPercentage,
  };

  const trends = {
    totalSalesTrend: { value: goalPercentage, isPositive: goalPercentage >= 100 },
    averageSaleTrend: { value: totalSales > 0 ? totalGross / totalSales : 0, isPositive: totalGross / totalSales >= monthlyGoal / 30 }, // Example trend calculation
  };

  return { summary, trends };
}
