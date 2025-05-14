
import { Sale, SalesSummary } from "@/lib/types";
import { DashboardTrends } from "./types";

/**
 * Calculates sales summary and trends based on sales data
 */
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
