
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Sale } from "@/lib/types";
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

interface WeeklyReportSectionProps {
  salesData: Sale[];
  isLoading?: boolean;
}

export function WeeklyReportSection({ salesData, isLoading = false }: WeeklyReportSectionProps) {
  const weeklyData = useMemo(() => {
    if (!salesData.length) return [];
    
    // Group sales by week
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Initialize weekly totals
    const weeklyTotals: Record<number, { week: number, sales: number, amount: number }> = {
      1: { week: 1, sales: 0, amount: 0 },
      2: { week: 2, sales: 0, amount: 0 },
      3: { week: 3, sales: 0, amount: 0 },
      4: { week: 4, sales: 0, amount: 0 },
      5: { week: 5, sales: 0, amount: 0 }, // Some months have parts of a 5th week
    };
    
    // Process sales data
    salesData.forEach(sale => {
      try {
        // Parse the sale date
        const saleDate = new Date(sale.sale_date);
        
        // Check if it's in the current month
        if (saleDate.getMonth() !== currentMonth || saleDate.getFullYear() !== currentYear) {
          return;
        }
        
        // Calculate week number (1-indexed)
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const dayOfWeekForFirst = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
        
        // Adjust day of week to make Monday the first day (0) and Sunday the last (6)
        const adjustedDayOfWeekForFirst = dayOfWeekForFirst === 0 ? 6 : dayOfWeekForFirst - 1;
        
        // Calculate the week number
        const dayOfMonth = saleDate.getDate();
        const week = Math.ceil((dayOfMonth + adjustedDayOfWeekForFirst) / 7);
        
        // Update totals
        if (weeklyTotals[week]) {
          weeklyTotals[week].sales += 1;
          weeklyTotals[week].amount += sale.gross_amount;
        }
      } catch (error) {
        console.error("Error processing sale date:", error, sale);
      }
    });
    
    // Convert to array and sort by week
    return Object.values(weeklyTotals)
      .filter(week => week.week <= 5) // Limit to 5 weeks max
      .map(week => ({
        name: `Semana ${week.week}`,
        Vendas: week.sales,
        Valor: week.amount,
        week: week.week,
      }))
      .sort((a, b) => a.week - b.week);
  }, [salesData]);
  
  const currentWeek = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfWeekForFirst = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Adjust day of week to make Monday the first day (0) and Sunday the last (6)
    const adjustedDayOfWeekForFirst = dayOfWeekForFirst === 0 ? 6 : dayOfWeekForFirst - 1;
    
    // Calculate the week number
    const dayOfMonth = now.getDate();
    return Math.ceil((dayOfMonth + adjustedDayOfWeekForFirst) / 7);
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Consolidado por Semana</CardTitle>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <p>Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Consolidado por Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          {weeklyData.length > 0 ? (
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
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Não há dados para exibir neste período.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
