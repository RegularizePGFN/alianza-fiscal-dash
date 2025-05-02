
import React from "react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Sale } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ChartContainer } from "@/components/ui/chart";

interface LineChartProps {
  data: Sale[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  // Group sales by month and calculate totals
  const monthlySales = data.reduce((acc: Record<string, { month: string, amount: number, count: number }>, sale) => {
    const date = parseISO(sale.sale_date);
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMM yyyy');
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthLabel,
        amount: 0,
        count: 0
      };
    }
    
    acc[monthKey].amount += sale.gross_amount;
    acc[monthKey].count += 1;
    
    return acc;
  }, {});
  
  // Convert to array and sort by month
  const chartData = Object.values(monthlySales).sort((a, b) => 
    a.month.localeCompare(b.month)
  );
  
  // Format currency values
  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  return (
    <ChartContainer 
      config={{
        amount: {
          color: '#8B5CF6'
        }
      }}
    >
      <RechartsLineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          height={50}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
          width={80}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), "Valor Total"]}
          labelFormatter={(label) => `Mês: ${label}`}
          contentStyle={{ 
            backgroundColor: "white", 
            borderRadius: "8px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
            border: "1px solid #e0e0e0" 
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: "10px" }} 
          verticalAlign="bottom"
        />
        <Line 
          type="monotone" 
          dataKey="amount" 
          name="Valor Total" 
          stroke="#8884d8" 
          strokeWidth={3}
          activeDot={{ r: 8, fill: "#8B5CF6", stroke: "white", strokeWidth: 2 }} 
          dot={{ stroke: "#8B5CF6", strokeWidth: 2, fill: "white", r: 4 }}
        />
      </RechartsLineChart>
    </ChartContainer>
  );
};
