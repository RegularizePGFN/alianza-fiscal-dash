import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  ClientRegistration,
  reasonLabel,
  statusLabel,
} from "@/hooks/useRegistrations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface Props {
  items: ClientRegistration[];
}

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function RegistrationsCharts({ items }: Props) {
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((r) => {
      const day = r.created_at.slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: format(new Date(date), "dd/MM"), count }));
  }, [items]);

  const byReason = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((r) => map.set(r.reason, (map.get(r.reason) || 0) + 1));
    return Array.from(map.entries()).map(([k, v]) => ({ name: reasonLabel(k), value: v }));
  }, [items]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((r) => map.set(r.status, (map.get(r.status) || 0) + 1));
    return Array.from(map.entries()).map(([k, v]) => ({ name: statusLabel(k), value: v }));
  }, [items]);

  const byBackoffice = useMemo(() => {
    const map = new Map<string, { count: number; totalH: number; completed: number }>();
    items.forEach((r) => {
      if (!r.backoffice_name) return;
      const cur = map.get(r.backoffice_name) || { count: 0, totalH: 0, completed: 0 };
      cur.count += 1;
      if (r.completed_at) {
        cur.completed += 1;
        cur.totalH +=
          (new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) /
          (1000 * 60 * 60);
      }
      map.set(r.backoffice_name, cur);
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        atendidos: v.count,
        media_horas: v.completed ? Number((v.totalH / v.completed).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.atendidos - a.atendidos);
  }, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Cadastros por dia</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byDay}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Por motivo</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={byReason} dataKey="value" nameKey="name" outerRadius={80} label>
              {byReason.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Por situação</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byStatus}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-3">
          Ranking do backoffice (atendidos x tempo médio)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byBackoffice}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="atendidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="media_horas" name="média (h)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
