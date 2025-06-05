
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Sale } from "@/lib/types";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesVolumeChartProps {
  salesData: Sale[];
}

export function SalesVolumeChart({ salesData }: SalesVolumeChartProps) {
  const chartData = useMemo(() => {
    const dailySales = salesData.reduce((acc, sale) => {
      const date = sale.sale_date;
      if (!acc[date]) {
        acc[date] = {
          date,
          volume: 0,
          count: 0
        };
      }
      acc[date].volume += sale.gross_amount;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; volume: number; count: number }>);

    return Object.values(dailySales)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'dd/MM', { locale: ptBR })
      }));
  }, [salesData]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Volume de Vendas Diário</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          config={{
            volume: {
              color: 'hsl(var(--primary))'
            }
          }}
        >
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Volume']}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorVolume)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
