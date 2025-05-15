
import { SummaryTrends } from "@/hooks/dashboard/types";
import { Sale, SalesSummary, UserRole } from "@/lib/types";
import { CommissionCard } from "./CommissionCard";
import { GoalProgressCard } from "./GoalProgressCard";
import { useAuth } from "@/contexts/auth";

interface GoalsCommissionsSectionProps {
  summary: SalesSummary;
  salesData: Sale[];
  trends?: SummaryTrends;
}

export function GoalsCommissionsSection({
  summary,
  salesData,
  trends
}: GoalsCommissionsSectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      <GoalProgressCard 
        totalSales={summary.total_sales} 
        goalAmount={summary.goal_amount} 
        goalPercentage={summary.goal_percentage}
        trends={trends}
      />
      <CommissionCard 
        totalSales={summary.total_sales} 
        goalAmount={summary.goal_amount} 
        salesData={salesData}
      />
    </div>
  );
}
