
import { getCurrentMonthDates } from "@/lib/utils";

interface DashboardHeaderProps {
  isLoading: boolean;
}

export function DashboardHeader({ isLoading }: DashboardHeaderProps) {
  const { start: monthStart } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Dashboard</h2>
      <p className="text-muted-foreground mt-1">
        Visão geral de vendas e comissões para {monthLabel}
      </p>
    </div>
  );
}
