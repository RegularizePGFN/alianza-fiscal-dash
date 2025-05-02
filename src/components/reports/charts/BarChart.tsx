
import { Sale } from "@/lib/types";
import { ChartContainer } from "@/components/ui/chart";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useMemo } from "react";

interface BarChartProps {
  data: Sale[];
}

export function BarChart({ data }: BarChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    const salespersonMap = new Map<string, number>();
    
    // Aggregate sales by salesperson
    data.forEach(sale => {
      const name = sale.salesperson_name || 'Desconhecido';
      const currentValue = salespersonMap.get(name) || 0;
      salespersonMap.set(name, currentValue + sale.gross_amount);
    });
    
    // Convert to array for chart
    return Array.from(salespersonMap.entries()).map(([name, value]) => ({
      name,
      valor: parseFloat(value.toFixed(2))
    }));
  }, [data]);

  // Colors for bars
  const colors = ["#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#33C3F0"];

  return (
    <ChartContainer 
      config={{
        value: {
          color: '#8B5CF6'
        }
      }}
    >
      <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} 
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
          labelFormatter={(label) => `Vendedor: ${label}`}
        />
        <Legend />
        <Bar dataKey="valor" name="Valor (R$)" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}
