
import React from "react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Sale } from "@/lib/types";
import { parseISODateString } from "@/lib/utils";
import { format } from "date-fns";
import { ChartContainer } from "@/components/ui/chart";

interface LineChartProps {
  data: Sale[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  // Group sales by day and calculate totals (instead of by month)
  const dailySales = data.reduce((acc: Record<string, { date: string, amount: number, count: number }>, sale) => {
    // Parse the sale date properly using our helper function
    const date = typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)
      ? parseISODateString(sale.sale_date)
      : new Date(sale.sale_date);
      
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayLabel = format(date, 'dd/MM');
    
    if (!acc[dayKey]) {
      acc[dayKey] = {
        date: dayLabel,
        amount: 0,
        count: 0
      };
    }
    
    acc[dayKey].amount += sale.gross_amount;
    acc[dayKey].count += 1;
    
    return acc;
  }, {});
  
  // Convert to array and sort by date
  const chartData = Object.values(dailySales).sort((a, b) => 
    a.date.localeCompare(b.date)
  );
  
  // Format currency values
  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            height={40}
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10 }}
            width={60}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), "Valor Total"]}
            labelFormatter={(label) => `Dia: ${label}`}
            contentStyle={{ 
              backgroundColor: "white", 
              borderRadius: "8px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
              border: "1px solid #e0e0e0" 
            }}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            name="Valor Total" 
            stroke="#8884d8" 
            strokeWidth={2}
            activeDot={{ r: 6, fill: "#8B5CF6", stroke: "white", strokeWidth: 2 }} 
            dot={{ stroke: "#8B5CF6", strokeWidth: 1, fill: "white", r: 3 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
