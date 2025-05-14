
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { CommissionCard } from "@/components/dashboard/CommissionCard";
import { DailyResultCard } from "@/components/dashboard/DailyResultCard";
import { SalesSummary } from "@/lib/types";
import { UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { Sale } from "@/lib/types";

interface GoalsCommissionsSectionProps {
  summary: SalesSummary;
  salesData: Sale[];
}

export function GoalsCommissionsSection({ summary, salesData }: GoalsCommissionsSectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  return (
    <div className="h-full">
      {isAdmin ? (
        <GoalProgressCard
          currentValue={summary.total_gross}
          goalValue={summary.goal_amount}
          className="h-full"
        />
      ) : (
        <CommissionCard
          totalSales={summary.total_gross}
          goalAmount={summary.goal_amount}
          className="h-full"
        />
      )}
    </div>
  );
}
