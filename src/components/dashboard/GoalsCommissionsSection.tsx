
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
  selectedMonth: number;
  selectedYear: number;
}

export function GoalsCommissionsSection({ summary, salesData, selectedMonth, selectedYear }: GoalsCommissionsSectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <GoalProgressCard
        currentValue={summary.total_gross}
        goalValue={summary.goal_amount}
      />
      {isAdmin ? (
        <DailyResultCard salesData={salesData} />
      ) : (
        <CommissionCard
          totalSales={summary.total_gross}
          goalAmount={summary.goal_amount}
          salesData={salesData}
        />
      )}
    </div>
  );
}
