
import { Sale } from "@/lib/types";
import { ChartContainer } from "@/components/ui/chart";
import {
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LineChartProps {
  data: Sale[];
}

export function LineChart({ data }: LineChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    const monthlyData = new Map<string, { count: number; amount: number }>();
    
    // Sort sales by date
    const sortedSales = [...data].sort((a, b) => 
      new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
    );
    
    // Group by month
    sortedSales.forEach(sale => {
      const date = parseISO(sale.sale_date);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM/yy', { locale: ptBR });
      
      const current = monthlyData.get(monthKey) || { 
        month: monthLabel,
        count: 0, 
        amount: 0 
      };
      
      monthlyData.set(monthKey, {
        month: monthLabel,
        count: current.count + 1,
        amount: current.amount + sale.gross_amount
      });
    });
    
    // Convert to array for chart
    return Array.from(monthlyData.values()).map(item => ({
      month: item.month,
      quantidade: item.count,
      valor: parseFloat(item.amount.toFixed(2))
    }));
  }, [data]);

  return (
    <ChartContainer
      config={{
        quantidade: {
          color: '#8B5CF6'
        },
        valor: {
          color: '#0EA5E9'
        }
      }}
    >
      <RechartsLineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number, name: string) => {
            if (name === 'valor') {
              return [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor Total'];
            }
            return [value, 'Quantidade'];
          }}
        />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="quantidade" 
          stroke="#8B5CF6" 
          name="Quantidade"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="valor" 
          stroke="#0EA5E9" 
          name="Valor (R$)" 
          strokeWidth={2}
        />
      </RechartsLineChart>
    </ChartContainer>
  );
}
