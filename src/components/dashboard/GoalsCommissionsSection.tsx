
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { CommissionCard } from "@/components/dashboard/CommissionCard";
import { SalesSummary } from "@/lib/types";

interface GoalsCommissionsSectionProps {
  summary: SalesSummary;
}

export function GoalsCommissionsSection({ summary }: GoalsCommissionsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <GoalProgressCard
        currentValue={summary.total_gross}
        goalValue={summary.goal_amount}
      />
      <CommissionCard
        totalSales={summary.total_gross}
        goalAmount={summary.goal_amount}
      />
    </div>
  );
}
