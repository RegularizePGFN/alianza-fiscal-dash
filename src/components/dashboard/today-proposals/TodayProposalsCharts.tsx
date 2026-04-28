import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DollarSign, Hash, BarChart3 } from "lucide-react";
import type { TodayProposal } from "./useTodayProposals";

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

type Mode = "fees" | "count" | "both";

interface Props {
  data: TodayProposal[];
}

export function TodayProposalsCharts({ data }: Props) {
  const [mode, setMode] = useState<Mode>("fees");

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
    const map = new Map<string, { fees: number; count: number }>();
    data.forEach((p) => {
      const cur = map.get(p.userName) ?? { fees: 0, count: 0 };
      cur.fees += p.feesValue;
      cur.count += 1;
      map.set(p.userName, cur);
    });
    const sortKey = mode === "count" ? "count" : "fees";
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, fees: v.fees, count: v.count }))
      .sort((a, b) => (b as any)[sortKey] - (a as any)[sortKey])
      .slice(0, 8);
  }, [data, mode]);

  const primary = "hsl(var(--primary))";
  const accent = "hsl(var(--accent-foreground))";

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
              <Bar dataKey="count" fill={primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Por vendedor */}
      <div className="rounded-md border p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-muted-foreground">
            {mode === "fees" && "Honorários por vendedor"}
            {mode === "count" && "Propostas por vendedor"}
            {mode === "both" && "Honorários e propostas por vendedor"}
          </div>
          <ToggleGroup
            type="single"
            size="sm"
            value={mode}
            onValueChange={(v) => v && setMode(v as Mode)}
            className="gap-0.5"
          >
            <ToggleGroupItem
              value="fees"
              aria-label="Honorários"
              title="Honorários"
              className="h-6 w-7 px-0"
            >
              <DollarSign className="h-3 w-3" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="count"
              aria-label="Quantidade"
              title="Quantidade de propostas"
              className="h-6 w-7 px-0"
            >
              <Hash className="h-3 w-3" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="both"
              aria-label="Ambos"
              title="Ambos"
              className="h-6 w-7 px-0"
            >
              <BarChart3 className="h-3 w-3" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className={mode === "both" ? "h-[260px]" : "h-[220px]"}>
          <ResponsiveContainer width="100%" height="100%">
            {mode === "fees" ? (
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
                <Bar dataKey="fees" fill={primary} radius={[0, 4, 4, 0]}>
                  {bySalesperson.map((_, i) => (
                    <Cell key={i} fill={primary} fillOpacity={1 - i * 0.07} />
                  ))}
                </Bar>
              </BarChart>
            ) : mode === "count" ? (
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
                  allowDecimals={false}
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
                  formatter={(v: number) => [v, "Propostas"]}
                />
                <Bar dataKey="count" fill={primary} radius={[0, 4, 4, 0]}>
                  {bySalesperson.map((_, i) => (
                    <Cell key={i} fill={primary} fillOpacity={1 - i * 0.07} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              // mode === "both" — layout vertical com 2 eixos Y, garantindo que TODOS os nomes apareçam
              <BarChart
                data={bySalesperson}
                margin={{ top: 8, right: 8, bottom: 36, left: -8 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  yAxisId="fees"
                  type="number"
                  tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => fmtCurrency(Number(v))}
                  width={60}
                />
                <YAxis
                  yAxisId="count"
                  type="number"
                  orientation="right"
                  tick={{ fontSize: 9 }}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(v: number, name: string) =>
                    name === "Honorários" ? [fmtCurrency(Number(v)), name] : [v, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="fees" dataKey="fees" name="Honorários" fill={primary} radius={[3, 3, 0, 0]} />
                <Bar yAxisId="count" dataKey="count" name="Propostas" fill={accent} radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
