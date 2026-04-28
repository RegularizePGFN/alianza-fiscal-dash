import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TodayProposal } from "./useTodayProposals";

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

interface Props {
  data: TodayProposal[];
}

export function TodayProposalsCharts({ data }: Props) {
  const kpis = useMemo(() => {
    const count = data.length;
    const fees = data.reduce((s, p) => s + p.feesValue, 0);
    const avg = count > 0 ? fees / count : 0;
    return { count, fees, avg };
  }, [data]);

  const byHour = useMemo(() => {
    const map = new Map<number, number>();
    for (let h = 8; h <= 19; h++) map.set(h, 0);
    data.forEach((p) => {
      const h = new Date(p.createdAt).getHours();
      map.set(h, (map.get(h) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([hour, count]) => ({ hour: `${String(hour).padStart(2, "0")}h`, count }));
  }, [data]);

  const bySalesperson = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((p) => {
      map.set(p.userName, (map.get(p.userName) ?? 0) + p.feesValue);
    });
    return Array.from(map.entries())
      .map(([name, fees]) => ({ name, fees }))
      .sort((a, b) => b.fees - a.fees)
      .slice(0, 8);
  }, [data]);

  const barColor = "hsl(var(--primary))";

  return (
    <div className="flex flex-col gap-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Propostas</div>
          <div className="text-lg font-bold tabular-nums">{kpis.count}</div>
        </div>
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Honorários</div>
          <div className="text-lg font-bold tabular-nums text-primary">{fmtCurrency(kpis.fees)}</div>
        </div>
        <div className="rounded-md border bg-muted/30 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Ticket Médio</div>
          <div className="text-lg font-bold tabular-nums">{fmtCurrency(kpis.avg)}</div>
        </div>
      </div>

      {/* Propostas por hora */}
      <div className="rounded-md border p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Propostas por hora</div>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byHour} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(v: number) => [v, "Propostas"]}
              />
              <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Honorários por vendedor */}
      <div className="rounded-md border p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Honorários por vendedor</div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bySalesperson}
              layout="vertical"
              margin={{ top: 4, right: 12, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => fmtCurrency(Number(v))}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(v: number) => [fmtCurrency(Number(v)), "Honorários"]}
              />
              <Bar dataKey="fees" fill={barColor} radius={[0, 4, 4, 0]}>
                {bySalesperson.map((_, i) => (
                  <Cell key={i} fill={barColor} fillOpacity={1 - i * 0.07} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
