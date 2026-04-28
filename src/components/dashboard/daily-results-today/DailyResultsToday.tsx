import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { useTodayResults } from "./useTodayResults";
import { SkeletonCard } from "../ui/SkeletonCard";
import { KPICard } from "../ui/KPICard";
import { FileText, DollarSign, TrendingUp, MousePointerClick, ArrowUpRight } from "lucide-react";
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
            className="group relative text-left rounded-xl cursor-pointer transition-all duration-200
              ring-1 ring-primary/30 hover:ring-2 hover:ring-primary
              shadow-sm hover:shadow-lg hover:-translate-y-0.5
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Abrir detalhes das propostas de hoje"
          >
            {/* "Click me" pill in the top-right corner */}
            <span
              className="pointer-events-none absolute -top-2 -right-2 z-10 inline-flex items-center gap-1
                rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground
                shadow-md ring-2 ring-background
                animate-pulse group-hover:animate-none"
            >
              <MousePointerClick className="h-3 w-3" />
              Ver detalhes
            </span>

            {proposalsCard}

            {/* Bottom-right hover hint arrow */}
            <span
              className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-0.5
                text-[10px] font-medium text-primary opacity-70 group-hover:opacity-100 transition-opacity"
            >
              Abrir
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
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
