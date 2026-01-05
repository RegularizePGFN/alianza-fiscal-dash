
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { useTodayResults } from "./useTodayResults";
import { SkeletonCard } from "../ui/SkeletonCard";
import { KPICard } from "../ui/KPICard";
import { FileText, DollarSign, TrendingUp } from "lucide-react";

export function DailyResultsToday() {
  const { user } = useAuth();
  const { results, loading } = useTodayResults();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard variant="kpi" />
        <SkeletonCard variant="kpi" />
        <SkeletonCard variant="kpi" />
      </div>
    );
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KPICard
        title={isAdmin ? "Propostas da Equipe Hoje" : "Minhas Propostas Hoje"}
        value={results.proposalsCount}
        subtitle={isAdmin ? "Propostas criadas pela equipe" : "Propostas que criei hoje"}
        icon={FileText}
        variant="blue"
        format="number"
        tooltip="Total de propostas criadas hoje"
      />
      
      <KPICard
        title={isAdmin ? "Simulações Hoje" : "Minhas Simulações Hoje"}
        value={Math.max(0, results.totalFees)}
        subtitle={isAdmin ? "Honorários das simulações" : "Honorários das minhas simulações"}
        icon={DollarSign}
        variant="green"
        format="currency"
        tooltip="Valor total de honorários simulados"
      />
      
      <KPICard
        title={isAdmin ? "Comissões da Equipe Hoje" : "Minhas Comissões Hoje"}
        value={results.totalCommissions}
        subtitle={isAdmin ? "Comissões das vendas hoje" : "Comissões das minhas vendas"}
        icon={TrendingUp}
        variant="purple"
        format="currency"
        tooltip="Total de comissões do dia"
      />
    </div>
  );
}
