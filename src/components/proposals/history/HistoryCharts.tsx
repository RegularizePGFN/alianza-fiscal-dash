import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type {
  HistoryDailyPoint,
  HistoryBySeller,
} from '@/hooks/proposals/useProposalsHistory';

const SELLER_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

interface Props {
  from: Date;
  to: Date; // exclusive
  daily: HistoryDailyPoint[];
  bySeller: HistoryBySeller[];
  showBySeller: boolean;
  isLoading: boolean;
}

export const HistoryCharts: React.FC<Props> = ({
  from,
  to,
  daily,
  bySeller,
  showBySeller,
  isLoading,
}) => {
  const dailyData = useMemo(() => {
    const map = new Map(daily.map((d) => [d.date.slice(0, 10), d]));
    const end = new Date(to.getTime() - 1);
    const days = eachDayOfInterval({ start: from, end });
    return days.map((d) => {
      const key = format(d, 'yyyy-MM-dd');
      const entry = map.get(key);
      return {
        date: key,
        label: format(d, 'dd/MM', { locale: ptBR }),
        count: Number(entry?.count ?? 0),
        fees: Number(entry?.fees ?? 0),
      };
    });
  }, [daily, from, to]);

  const sellerData = useMemo(
    () =>
      bySeller
        .slice(0, 8)
        .map((s, i) => ({ ...s, color: SELLER_COLORS[i % SELLER_COLORS.length] })),
    [bySeller],
  );

  const grid = `grid gap-3 ${showBySeller ? 'lg:grid-cols-2' : 'grid-cols-1'}`;

  if (isLoading) {
    return (
      <div className={grid}>
        <Skeleton className="h-[260px] rounded-lg" />
        {showBySeller && <Skeleton className="h-[260px] rounded-lg" />}
      </div>
    );
  }

  return (
    <div className={grid}>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Propostas por dia</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickMargin={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                  }}
                  formatter={(v: any, name: any) =>
                    name === 'fees' ? [formatCurrency(v as number), 'Honorários'] : [v, 'Propostas']
                  }
                  labelFormatter={(l) => `Dia ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#gradCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {showBySeller && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top vendedores</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[220px]">
              {sellerData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Sem dados para o período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sellerData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 10 }}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                      }}
                      formatter={(v: any, _n: any, p: any) => [
                        `${v} propostas — ${formatCurrency(p.payload.fees)}`,
                        p.payload.name,
                      ]}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {sellerData.map((entry) => (
                        <Cell key={entry.user_id} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoryCharts;
