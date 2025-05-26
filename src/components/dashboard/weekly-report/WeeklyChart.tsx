
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface WeeklyChartProps {
  weeklyData: Array<{
    name: string;
    Vendas: number;
    Valor: number;
    week: number;
  }>;
  currentWeek: number;
}

export function WeeklyChart({ weeklyData, currentWeek }: WeeklyChartProps) {
  if (weeklyData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Não há dados para exibir neste período.</p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        Vendas: {
          label: "Qtd. Vendas",
          color: "#8884d8"
        },
        Valor: {
          label: "Valor Total",
          color: "#82ca9d"
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={weeklyData}
          margin={{ top: 10, right: 5, left: 0, bottom: 20 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            orientation="left" 
            stroke="#8884d8"
            axisLine={false}
            tickLine={false}
            width={30}
            fontSize={11}
          />
          <YAxis 
            yAxisId="right"
            orientation="right" 
            stroke="#82ca9d"
            tickFormatter={(value) => formatCurrency(value)}
            axisLine={false}
            tickLine={false}
            width={60}
            fontSize={11}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === "Valor") {
                return [formatCurrency(value), "Valor Total"];
              }
              return [value, "Qtd. Vendas"];
            }}
          />
          <Legend />
          <Bar 
            yAxisId="left" 
            name="Vendas"
            dataKey="Vendas" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]}
            barSize={20}
          >
            {weeklyData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.week === currentWeek ? '#4c1d95' : '#8884d8'} 
                opacity={entry.week === currentWeek ? 1 : 0.7}
              />
            ))}
          </Bar>
          <Bar 
            yAxisId="right" 
            name="Valor"
            dataKey="Valor" 
            fill="#82ca9d" 
            radius={[4, 4, 0, 0]}
            barSize={20}
          >
            {weeklyData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.week === currentWeek ? '#065f46' : '#82ca9d'} 
                opacity={entry.week === currentWeek ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
