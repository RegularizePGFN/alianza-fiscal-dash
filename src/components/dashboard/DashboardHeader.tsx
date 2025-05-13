
import { getCurrentMonthDates } from "@/lib/utils";

interface DashboardHeaderProps {
  isLoading: boolean;
}

export function DashboardHeader({ isLoading }: DashboardHeaderProps) {
  const { start: monthStart } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="mb-1">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        Dashboard
      </h2>
      <p className="text-sm text-muted-foreground">
        Visão geral de vendas e comissões para {monthLabel}
      </p>
    </div>
  );
}
