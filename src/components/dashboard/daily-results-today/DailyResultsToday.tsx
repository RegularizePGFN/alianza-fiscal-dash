import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { useTodayResults } from "./useTodayResults";
import { SkeletonCard } from "../ui/SkeletonCard";
import { KPICard } from "../ui/KPICard";
import { FileText, DollarSign, TrendingUp } from "lucide-react";
import { TodayProposalsDialog } from "../today-proposals";

export function DailyResultsToday() {
  const { user } = useAuth();
  const { results, loading } = useTodayResults();
  const [proposalsOpen, setProposalsOpen] = useState(false);

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

  const proposalsCard = (
    <KPICard
      title={isAdmin ? "Propostas da Equipe Hoje" : "Minhas Propostas Hoje"}
      value={results.proposalsCount}
      subtitle={
        isAdmin
          ? "Clique para ver detalhes e forecast"
          : "Propostas que criei hoje"
      }
      icon={FileText}
      variant="blue"
      format="number"
      tooltip={isAdmin ? "Clique para abrir o detalhamento das propostas de hoje" : "Total de propostas criadas hoje"}
    />
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setProposalsOpen(true)}
            className="text-left rounded-lg cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Abrir detalhes das propostas de hoje"
          >
            {proposalsCard}
          </button>
        ) : (
          proposalsCard
        )}

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

      {isAdmin && (
        <TodayProposalsDialog open={proposalsOpen} onOpenChange={setProposalsOpen} />
      )}
    </>
  );
}
