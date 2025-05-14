
import { getCurrentMonthDates } from "@/lib/utils";
interface DashboardHeaderProps {
  isLoading: boolean;
}
export function DashboardHeader({
  isLoading
}: DashboardHeaderProps) {
  const {
    start: monthStart
  } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });
  return <div className="mb-4">
      <p className="text-muted-foreground">
        Visão geral de vendas e comissões para {monthLabel}
      </p>
    </div>;
}
