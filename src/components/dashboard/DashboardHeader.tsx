import { getCurrentMonthDates } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
interface DashboardHeaderProps {
  isLoading: boolean;
}
export function DashboardHeader({
  isLoading
}: DashboardHeaderProps) {
  const {
    user
  } = useAuth();
  const {
    start: monthStart
  } = getCurrentMonthDates();
  const monthLabel = monthStart.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });
  return <div className="space-y-2">
      
      
      <p className="text-muted-foreground dark:text-gray-300">
        Visão geral de vendas e comissões para {monthLabel}
      </p>
    </div>;
}