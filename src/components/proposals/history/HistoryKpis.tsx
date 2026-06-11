import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, DollarSign, Calculator, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { HistoryKpis as Kpis } from '@/hooks/proposals/useProposalsHistory';

interface Props {
  kpis: Kpis | undefined;
  isLoading: boolean;
}

const Card1: React.FC<{
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  hint?: string;
  accent?: string;
}> = ({ title, value, icon, hint, accent }) => (
  <Card className="overflow-hidden border-border/60 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {title}
          </p>
          <p className={`mt-1 text-xl font-semibold tabular-nums ${accent ?? ''}`}>{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
        <div className="rounded-lg bg-primary/10 text-primary p-2 shrink-0">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

export const HistoryKpis: React.FC<Props> = ({ kpis, isLoading }) => {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card1
        title="Propostas no período"
        value={kpis.total_count.toLocaleString('pt-BR')}
        icon={<FileText className="h-4 w-4" />}
      />
      <Card1
        title="Valor consolidado"
        value={formatCurrency(kpis.total_consolidated)}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <Card1
        title="Honorários"
        value={formatCurrency(kpis.total_fees)}
        icon={<Calculator className="h-4 w-4" />}
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <Card1
        title="Desconto médio"
        value={`${kpis.avg_discount.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`}
        icon={<TrendingDown className="h-4 w-4" />}
      />
    </div>
  );
};

export default HistoryKpis;
