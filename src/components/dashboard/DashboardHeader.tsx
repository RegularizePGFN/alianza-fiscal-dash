
import { getCurrentMonthDates } from "@/lib/utils";

interface DashboardHeaderProps {
  isLoading: boolean;
}

export function DashboardHeader({ isLoading }: DashboardHeaderProps) {
  const { start: monthStart } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <p className="text-muted-foreground">
        Visão geral para {monthLabel}
      </p>
    </div>
  );
}
