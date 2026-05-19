import { ClientRegistration } from "@/hooks/useRegistrations";
import { Card } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle2, Timer } from "lucide-react";
import { useMemo } from "react";

interface Props {
  items: ClientRegistration[];
}

function formatAvgMinutes(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function RegistrationsKpiCards({ items }: Props) {
  const { total, aguardando, realizadosHoje, avgMinutes } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let totalCompleted = 0;
    let sumMinutes = 0;
    items.forEach((r) => {
      if (r.completed_at) {
        const diffMin =
          (new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) /
          (1000 * 60);
        sumMinutes += diffMin;
        totalCompleted++;
      }
    });
    return {
      total: items.length,
      aguardando: items.filter((r) => r.status === "aguardando").length,
      realizadosHoje: items.filter(
        (r) => r.status === "realizado" && r.completed_at?.slice(0, 10) === today
      ).length,
      avgMinutes: totalCompleted ? sumMinutes / totalCompleted : 0,
    };
  }, [items]);

  const kpis = [
    { label: "Cadastros no período", value: total, icon: ClipboardList, color: "text-blue-500" },
    { label: "Aguardando", value: aguardando, icon: Clock, color: "text-amber-500" },
    { label: "Realizados hoje", value: realizadosHoje, icon: CheckCircle2, color: "text-emerald-500" },
    {
      label: "Tempo médio de cadastro",
      value: formatAvgMinutes(avgMinutes),
      icon: Timer,
      color: "text-violet-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <Card key={k.label} className="p-4 flex items-center gap-3">
          <div className={`p-2 rounded-md bg-muted ${k.color}`}>
            <k.icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground truncate">{k.label}</div>
            <div className="text-2xl font-semibold tabular-nums">{k.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
