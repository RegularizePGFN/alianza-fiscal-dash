import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, FileText, ShoppingCart, Target, Clock, Zap } from "lucide-react";
import { IntelSummary } from "@/hooks/useCommercialIntel";

const fmtMoney = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
const fmtInt = (v: number) => v.toLocaleString("pt-BR");

interface Props {
  data?: IntelSummary;
  loading: boolean;
}

export function IntelKpiCards({ data, loading }: Props) {
  const cards = [
    {
      label: "Propostas criadas",
      value: data ? fmtInt(data.total_proposals) : "—",
      sub: data ? fmtMoney(data.total_proposals_value) : "",
      icon: FileText,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Vendas fechadas",
      value: data ? fmtInt(data.total_sales) : "—",
      sub: data ? fmtMoney(data.total_sales_value) : "",
      icon: ShoppingCart,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Taxa de conversão",
      value: data ? `${data.conversion_rate.toFixed(1)}%` : "—",
      sub: data ? `${fmtInt(data.matched_sales)} vendas vindas de proposta` : "",
      icon: Target,
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      label: "Tempo médio até venda",
      value: data ? `${data.avg_days_to_convert.toFixed(1)}d` : "—",
      sub: data ? `Mediana ${data.median_days_to_convert.toFixed(0)}d` : "",
      icon: Clock,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Vendas no mesmo dia",
      value: data ? fmtInt(data.same_day_count) : "—",
      sub:
        data && data.matched_sales > 0
          ? `${((data.same_day_count / data.matched_sales) * 100).toFixed(0)}% das convertidas`
          : "",
      icon: Zap,
      color: "text-pink-500 bg-pink-500/10",
    },
    {
      label: "Faturado via proposta",
      value: data ? fmtMoney(data.matched_sales_value) : "—",
      sub:
        data && data.total_sales_value > 0
          ? `${((data.matched_sales_value / data.total_sales_value) * 100).toFixed(0)}% do total`
          : "",
      icon: TrendingUp,
      color: "text-cyan-500 bg-cyan-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                {c.label}
              </p>
              {loading ? (
                <Skeleton className="h-7 w-24 mt-2" />
              ) : (
                <p className="text-2xl font-semibold mt-1 tabular-nums">{c.value}</p>
              )}
              {!loading && c.sub && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{c.sub}</p>
              )}
            </div>
            <div className={`p-2 rounded-lg ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
