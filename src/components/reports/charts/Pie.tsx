
import { Sale, PaymentMethod } from "@/lib/types";
import { ChartContainer } from "@/components/ui/chart";
import {
  PieChart,
  Pie as RechartsPie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { useMemo } from "react";

interface PieProps {
  data: Sale[];
}

export function Pie({ data }: PieProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    const methodsCount = new Map<PaymentMethod, number>();
    
    // Initialize with all payment methods
    Object.values(PaymentMethod).forEach(method => {
      methodsCount.set(method, 0);
    });
    
    // Count occurrences of each payment method
    data.forEach(sale => {
      const currentCount = methodsCount.get(sale.payment_method) || 0;
      methodsCount.set(sale.payment_method, currentCount + 1);
    });
    
    // Convert to array for chart
    return Array.from(methodsCount.entries())
      .filter(([_, count]) => count > 0) // Only show methods with values
      .map(([method, count]) => ({
        name: method,
        value: count
      }));
  }, [data]);

  // Colors for pie slices
  const COLORS = {
    [PaymentMethod.CREDIT]: "#8B5CF6", // Purple
    [PaymentMethod.DEBIT]: "#0EA5E9",  // Blue
    [PaymentMethod.PIX]: "#10B981",    // Green
    [PaymentMethod.BOLETO]: "#F97316"  // Orange
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name
  }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
          <RechartsPie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name as PaymentMethod] || "#8884d8"} 
              />
            ))}
          </RechartsPie>
          <Tooltip 
            formatter={(value) => [`${value} vendas`, 'Quantidade']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
