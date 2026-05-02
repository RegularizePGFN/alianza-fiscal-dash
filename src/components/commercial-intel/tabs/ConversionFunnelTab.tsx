import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IntelSummary } from "@/hooks/useCommercialIntel";

const fmtMoney = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  data?: IntelSummary;
  loading: boolean;
}

export function ConversionFunnelTab({ data, loading }: Props) {
  if (loading || !data) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  const stages = [
    {
      label: "Propostas criadas",
      value: data.total_proposals,
      moneyValue: data.total_proposals_value,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Vendas convertidas (mesmo CNPJ + vendedor)",
      value: data.matched_sales,
      moneyValue: data.matched_sales_value,
      color: "from-violet-500 to-violet-600",
    },
    {
      label: "Faturamento total no período",
      value: data.total_sales,
      moneyValue: data.total_sales_value,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  const max = Math.max(...stages.map((s) => s.value), 1);

  // Eficiência de negociação = valor fechado / valor proposto (das matched)
  const avgProposalAmount = data.matched_sales > 0 ? data.matched_sales_value / data.matched_sales : 0;
  const avgPropTotal =
    data.total_proposals > 0 ? data.total_proposals_value / data.total_proposals : 0;
  const avgSaleAmount = data.total_sales > 0 ? data.total_sales_value / data.total_sales : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-semibold mb-1">Funil Proposta → Venda</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Quantas das propostas geradas viraram venda real (cruzamento por CNPJ + vendedor).
        </p>

        <div className="space-y-4">
          {stages.map((s, i) => {
            const widthPct = (s.value / max) * 100;
            const dropFromPrev = i > 0 ? (s.value / stages[i - 1].value) * 100 : 100;
            return (
              <div key={s.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {i > 0 && `${dropFromPrev.toFixed(1)}% da etapa anterior`}
                  </span>
                </div>
                <div className="relative h-12 bg-muted/30 rounded-md overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${s.color} flex items-center px-4`}
                    style={{ width: `${Math.max(widthPct, 8)}%` }}
                  >
                    <div className="text-white">
                      <div className="text-lg font-semibold leading-none">
                        {s.value.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[11px] opacity-90">{fmtMoney(s.moneyValue)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t">
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Taxa de conversão</p>
            <p className="text-2xl font-semibold tabular-nums">
              {data.conversion_rate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Vendas SEM proposta prévia</p>
            <p className="text-2xl font-semibold tabular-nums">
              {(data.total_sales - data.matched_sales).toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.total_sales > 0
                ? `${(((data.total_sales - data.matched_sales) / data.total_sales) * 100).toFixed(0)}% das vendas`
                : ""}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Mesmo dia</p>
            <p className="text-2xl font-semibold tabular-nums">{data.same_day_count}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-1">Eficiência da negociação</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Tickets médios e desconto real praticado nas vendas vindas de proposta.
        </p>

        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground">Ticket médio das propostas (período)</p>
            <p className="text-xl font-semibold tabular-nums">{fmtMoney(avgPropTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ticket médio das vendas (período)</p>
            <p className="text-xl font-semibold tabular-nums">{fmtMoney(avgSaleAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Ticket médio das vendas convertidas
            </p>
            <p className="text-xl font-semibold tabular-nums text-emerald-500">
              {fmtMoney(avgProposalAmount)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
