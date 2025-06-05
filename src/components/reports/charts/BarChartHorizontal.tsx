
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
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 10, left: 60, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis 
            type="number"
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 10 }}
            width={50}
          />
          <Tooltip 
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
          />
          <Bar dataKey="valor" name="Valor (R$)" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[entry.name as PaymentMethod] || "#8B5CF6"} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
