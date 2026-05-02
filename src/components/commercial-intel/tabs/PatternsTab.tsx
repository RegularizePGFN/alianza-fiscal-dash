import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PatternRow } from "@/hooks/useCommercialIntel";

interface Props {
  data?: PatternRow[];
  loading: boolean;
}

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function PatternsTab({ data, loading }: Props) {
  const [source, setSource] = useState<"sale" | "proposal">("sale");

  const grid = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    (data || [])
      .filter((r) => r.source === source)
      .forEach((r) => {
        if (r.dow >= 0 && r.dow < 7 && r.hour >= 0 && r.hour < 24) {
          g[r.dow][r.hour] = r.count;
        }
      });
    return g;
  }, [data, source]);

  const max = useMemo(() => {
    let m = 0;
    grid.forEach((row) => row.forEach((v) => v > m && (m = v)));
    return m || 1;
  }, [grid]);

  const insight = useMemo(() => {
    if (!data || data.length === 0) return null;
    // Total por hora
    const hourTotals = Array(24).fill(0);
    let total = 0;
    data
      .filter((r) => r.source === source)
      .forEach((r) => {
        hourTotals[r.hour] += r.count;
        total += r.count;
      });
    if (total === 0) return null;
    // Encontra janela de 4h consecutivas com maior soma
    let bestStart = 0,
      bestSum = 0;
    for (let h = 0; h <= 20; h++) {
      const sum = hourTotals.slice(h, h + 4).reduce((a, b) => a + b, 0);
      if (sum > bestSum) {
        bestSum = sum;
        bestStart = h;
      }
    }
    const pct = (bestSum / total) * 100;
    return {
      windowStart: bestStart,
      windowEnd: bestStart + 4,
      pct,
    };
  }, [data, source]);

  if (loading) return <Skeleton className="h-[500px] w-full" />;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Heatmap dia × hora</h3>
            <p className="text-sm text-muted-foreground">
              Concentração de {source === "sale" ? "vendas fechadas" : "propostas criadas"} por dia da semana e hora (fuso de São Paulo).
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={source}
            onValueChange={(v) => v && setSource(v as any)}
            size="sm"
          >
            <ToggleGroupItem value="sale">Vendas</ToggleGroupItem>
            <ToggleGroupItem value="proposal">Propostas</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {insight && (
          <div className="mb-4 p-3 rounded-md bg-primary/5 border border-primary/20 text-sm">
            <span className="font-medium">Insight:</span>{" "}
            {(insight.pct).toFixed(0)}% das {source === "sale" ? "vendas" : "propostas"} acontecem entre{" "}
            <span className="font-semibold">{String(insight.windowStart).padStart(2, "0")}h</span>{" "}
            e{" "}
            <span className="font-semibold">{String(insight.windowEnd).padStart(2, "0")}h</span>.
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex">
              <div className="w-12" />
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="w-7 text-center text-[10px] text-muted-foreground tabular-nums"
                >
                  {h}
                </div>
              ))}
            </div>
            {DOW.map((day, dowIdx) => (
              <div key={day} className="flex items-center">
                <div className="w-12 text-xs text-muted-foreground font-medium">{day}</div>
                {HOURS.map((h) => {
                  const v = grid[dowIdx][h];
                  const intensity = v / max;
                  return (
                    <div
                      key={h}
                      className="w-7 h-7 m-[1px] rounded-sm flex items-center justify-center text-[10px] font-medium transition-colors"
                      style={{
                        backgroundColor:
                          intensity === 0
                            ? "hsl(var(--muted) / 0.3)"
                            : `hsl(var(--primary) / ${0.15 + intensity * 0.85})`,
                        color: intensity > 0.5 ? "white" : "hsl(var(--foreground))",
                      }}
                      title={`${day} ${h}h: ${v}`}
                    >
                      {v > 0 ? v : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Por dia da semana</h3>
          <div className="space-y-2">
            {DOW.map((day, idx) => {
              const total = grid[idx].reduce((a, b) => a + b, 0);
              const maxDay = Math.max(...DOW.map((_, i) => grid[i].reduce((a, b) => a + b, 0)), 1);
              const pct = (total / maxDay) * 100;
              return (
                <div key={day} className="flex items-center gap-3">
                  <div className="w-12 text-xs font-medium">{day}</div>
                  <div className="flex-1 h-6 bg-muted/40 rounded relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/70 to-primary"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-end px-2 text-xs font-medium">
                      {total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Por hora do dia</h3>
          <div className="flex items-end gap-1 h-48">
            {HOURS.map((h) => {
              const total = DOW.reduce((acc, _, idx) => acc + grid[idx][h], 0);
              const maxHour = Math.max(
                ...HOURS.map((hh) => DOW.reduce((acc, _, idx) => acc + grid[idx][hh], 0)),
                1,
              );
              const pct = (total / maxHour) * 100;
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all group-hover:opacity-80"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    title={`${h}h: ${total}`}
                  />
                  <div className="text-[9px] text-muted-foreground tabular-nums">{h}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
