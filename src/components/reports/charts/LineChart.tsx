
import React from "react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Sale } from "@/lib/types";
import { format, parseISO } from "date-fns";

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
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), "Valor Total"]}
          labelFormatter={(label) => `Mês: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="amount" 
          name="Valor Total" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }} 
          strokeWidth={2}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
