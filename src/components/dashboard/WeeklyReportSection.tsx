
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Colors for the chart
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#af19ff'];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Consolidado por Semana</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p>Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Consolidado por Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === "Valor") {
                      return [formatCurrency(value), "Valor Total"];
                    }
                    return [value, "Qtd. Vendas"];
                  }}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="Vendas" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
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
                  dataKey="Valor" 
                  fill="#82ca9d" 
                  radius={[4, 4, 0, 0]}
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
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Não há dados para exibir neste período.</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Total de Vendas</h4>
            <p className="text-2xl font-bold">
              {weeklyData.reduce((sum, week) => sum + week.Vendas, 0)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Valor Total</h4>
            <p className="text-2xl font-bold">
              {formatCurrency(weeklyData.reduce((sum, week) => sum + week.Valor, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
