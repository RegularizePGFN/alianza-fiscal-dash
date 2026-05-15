import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SalesReportRow } from "./useSalesReport";

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtCurrencyShort = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

interface Props {
  data: SalesReportRow[];
}

export function SalesReportCharts({ data }: Props) {
  const kpis = useMemo(() => {
    const count = data.length;
    const total = data.reduce((s, r) => s + r.grossAmount, 0);
    const avg = count > 0 ? total / count : 0;
    return { count, total, avg };
  }, [data]);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((r) => {
      map.set(r.saleDate, (map.get(r.saleDate) ?? 0) + r.grossAmount);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([d, total]) => ({
        day: format(parseISO(d), "dd/MM", { locale: ptBR }),
        total,
      }));
  }, [data]);

  const bySalesperson = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    data.forEach((r) => {
      const cur = map.get(r.userName) ?? { total: 0, count: 0 };
      cur.total += r.grossAmount;
      cur.count += 1;
      map.set(r.userName, cur);
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, total: v.total, count: v.count }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [data]);

  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((r) => {
      map.set(r.paymentMethod, (map.get(r.paymentMethod) ?? 0) + r.grossAmount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  const primary = "hsl(var(--primary))";
  const PIE_COLORS = [
    "hsl(var(--primary))",
    "hsl(217 91% 60%)",
    "hsl(142 71% 45%)",
    "hsl(38 92% 50%)",
    "hsl(280 65% 60%)",
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Vendas</div>
          <div className="text-lg font-bold tabular-nums">{kpis.count}</div>
        </div>
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</div>
          <div className="text-lg font-bold tabular-nums text-primary">{fmtCurrency(kpis.total)}</div>
        </div>
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Ticket Médio</div>
          <div className="text-lg font-bold tabular-nums">{fmtCurrency(kpis.avg)}</div>
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Vendas por dia</div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => fmtCurrencyShort(Number(v))} />
              <Tooltip
                contentStyle={{
                  fontSize: 12, background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))", borderRadius: 6,
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(v: number) => [fmtCurrency(Number(v)), "Total"]}
              />
              <Bar dataKey="total" fill={primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Vendas por vendedor</div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySalesperson} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => fmtCurrencyShort(Number(v))} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  fontSize: 12, background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))", borderRadius: 6,
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(v: number) => [fmtCurrency(Number(v)), "Total"]}
              />
              <Bar dataKey="total" fill={primary} radius={[0, 4, 4, 0]}>
                {bySalesperson.map((_, i) => (
                  <Cell key={i} fill={primary} fillOpacity={1 - i * 0.07} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {byPayment.length > 0 && (
        <div className="rounded-md border p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Por forma de pagamento</div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPayment} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={60} label={(e) => e.name}>
                  {byPayment.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12, background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))", borderRadius: 6,
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(v: number, n: string) => [fmtCurrency(Number(v)), n]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
