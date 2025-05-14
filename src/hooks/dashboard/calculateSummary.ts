
import { Sale, SalesSummary } from "@/lib/types";
import { DashboardTrends } from "./types";
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from "@/lib/constants";

/**
 * Calculates sales summary and trends based on sales data
 */
export const calculateSalesSummary = (
  sales: Sale[],
  monthlyGoal: number
): { summary: SalesSummary; trends: DashboardTrends } => {
  const totalAmount = sales.reduce((sum, sale) => sum + sale.gross_amount, 0);

  // Commission rate depends on meeting the FIXED commission goal (not the personal goal)
  const commissionRate = totalAmount >= COMMISSION_GOAL_AMOUNT 
    ? COMMISSION_RATE_ABOVE_GOAL 
    : COMMISSION_RATE_BELOW_GOAL;
    
  const projectedCommission = totalAmount * commissionRate;

  // Goal percentage is based on personal goal, not commission goal
  const goalPercentage = monthlyGoal > 0 ? Math.min(totalAmount / monthlyGoal, 2) : 0;

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
      goal_percentage: goalPercentage,
    },
    trends: {
      totalSalesTrend,
      averageSaleTrend,
    },
  };
};
