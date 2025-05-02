
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
import { useIsMobile } from "@/hooks/use-mobile";

interface BarChartProps {
  data: Sale[];
}

export function BarChart({ data }: BarChartProps) {
  const isMobile = useIsMobile();

  // Process data for chart
  const chartData = useMemo(() => {
    const salespersonMap = new Map<string, number>();
    
    // Aggregate sales by salesperson
    data.forEach(sale => {
      const name = sale.salesperson_name || 'Desconhecido';
      const currentValue = salespersonMap.get(name) || 0;
      salespersonMap.set(name, currentValue + sale.gross_amount);
    });
    
    // Convert to array for chart and sort by value
    return Array.from(salespersonMap.entries())
      .map(([name, value]) => ({
        name: name.length > 12 ? `${name.substring(0, 12)}...` : name,
        fullName: name,
        valor: parseFloat(value.toFixed(2))
      }))
      .sort((a, b) => b.valor - a.valor); // Sort by value descending
  }, [data]);

  // Colors for bars - enhanced palette
  const COLORS = ["#8B5CF6", "#D946EF", "#0EA5E9", "#10B981", "#F97316", "#EAB308"];

  return (
    <ChartContainer 
      config={{
        value: {
          color: '#8B5CF6'
        }
      }}
    >
      <RechartsBarChart 
        data={chartData} 
        margin={{ 
          top: 20, 
          right: 30, 
          left: isMobile ? 10 : 30, 
          bottom: isMobile ? 90 : 70 
        }}
        barCategoryGap={isMobile ? "20%" : "30%"}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={isMobile ? 100 : 80}
          tick={{ fontSize: isMobile ? 10 : 12 }}
          interval={0}
        />
        <YAxis 
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short' })}`} 
          tick={{ fontSize: 12 }}
          width={isMobile ? 55 : 80}
        />
        <Tooltip 
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
          labelFormatter={(label, payload) => {
            if (payload && payload.length > 0) {
              // @ts-ignore - payload has fullName property
              return `Vendedor: ${payload[0].payload.fullName || label}`;
            }
            return `Vendedor: ${label}`;
          }}
          contentStyle={{ 
            backgroundColor: "white", 
            borderRadius: "8px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
            border: "1px solid #e0e0e0" 
          }}
        />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Bar 
          dataKey="valor" 
          name="Valor (R$)" 
          radius={[4, 4, 0, 0]} 
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke="#ffffff"
              strokeWidth={1}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}
