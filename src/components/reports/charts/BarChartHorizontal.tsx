
import { Sale, PaymentMethod } from "@/lib/types";
import { ChartContainer } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useMemo } from "react";

interface BarChartHorizontalProps {
  data: Sale[];
}

export function BarChartHorizontal({ data }: BarChartHorizontalProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    const paymentMap = new Map<PaymentMethod, number>();
    
    // Initialize with all payment methods
    Object.values(PaymentMethod).forEach(method => {
      paymentMap.set(method, 0);
    });
    
    // Aggregate sales by payment method
    data.forEach(sale => {
      const currentValue = paymentMap.get(sale.payment_method) || 0;
      paymentMap.set(sale.payment_method, currentValue + sale.gross_amount);
    });
    
    // Convert to array for chart and translate payment methods
    return Array.from(paymentMap.entries())
      .filter(([_, value]) => value > 0) // Only show methods with values
      .map(([method, value]) => ({
        name: method,
        valor: parseFloat(value.toFixed(2))
      }));
  }, [data]);

  // Colors for bars
  const colors = {
    [PaymentMethod.CREDIT]: "#8B5CF6", // Purple
    [PaymentMethod.DEBIT]: "#0EA5E9",  // Blue
    [PaymentMethod.PIX]: "#10B981",    // Green
    [PaymentMethod.BOLETO]: "#F97316"  // Orange
  };

  return (
    <ChartContainer 
      config={{
        value: {
          color: '#8B5CF6'
        }
      }}
    >
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis 
          type="number"
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
        />
        <Legend />
        <Bar dataKey="valor" name="Valor (R$)" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[entry.name as PaymentMethod] || "#8B5CF6"} 
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
