import { getCurrentMonthDates } from "@/lib/utils";

interface DashboardHeaderProps {
  isLoading: boolean;
}

export function DashboardHeader({ isLoading }: DashboardHeaderProps) {
  // We'll keep the month info but remove redundant headers
  const { start: monthStart } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {monthLabel}
      </p>
    </div>
  );
}
