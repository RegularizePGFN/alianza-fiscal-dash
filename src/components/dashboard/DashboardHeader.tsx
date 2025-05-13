
import { getCurrentMonthDates } from "@/lib/utils";

interface DashboardHeaderProps {
  isLoading: boolean;
}

export function DashboardHeader({ isLoading }: DashboardHeaderProps) {
  const { start: monthStart } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Visão geral de vendas e comissões para {monthLabel}
      </p>
    </div>
  );
}
