
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface DailyResultCardProps {
  salesData: Sale[];
}

export function DailyResultCard({ salesData }: DailyResultCardProps) {
  // Agrupar vendas por dia
  const dailyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar vendas do mês atual
    const currentMonthSales = salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    // Agrupar por dia
    const salesByDay: Record<string, { day: string, value: number, date: string }> = {};
    
    currentMonthSales.forEach(sale => {
      const saleDate = new Date(sale.sale_date);
      const dayKey = saleDate.getDate().toString();
      const formattedDay = dayKey.padStart(2, '0');
      
      if (!salesByDay[dayKey]) {
        salesByDay[dayKey] = {
          day: formattedDay,
          value: 0,
          date: sale.sale_date
        };
      }
      
      salesByDay[dayKey].value += sale.gross_amount;
    });
    
    // Converter para array e ordenar por dia
    return Object.values(salesByDay).sort((a, b) => 
      parseInt(a.day) - parseInt(b.day)
    );
  }, [salesData]);
  
  // Calcular o total de vendas
  const totalSales = useMemo(() => {
    return dailyData.reduce((sum, item) => sum + item.value, 0);
  }, [dailyData]);

  // Formatar dados para o tooltip
  const formatTooltip = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Resultado Diário (Mês Atual)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">{formatCurrency(totalSales)}</span>
          <span className="text-lg font-semibold text-muted-foreground">
            {dailyData.length} dias com vendas
          </span>
        </div>
        
        <div className="w-full h-40 overflow-hidden">
          <ChartContainer
            config={{
              sales: {
                color: '#8B5CF6'  // Cor primária
              }
            }}
            className="w-full h-full"
          >
            <ResponsiveContainer width="99%" height="99%">
              <LineChart 
                data={dailyData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10 }} 
                  tickMargin={5}
                />
                <YAxis 
                  tickFormatter={(value) => `${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                  tick={{ fontSize: 10 }}
                  width={30}
                />
                <Tooltip
                  formatter={formatTooltip}
                  labelFormatter={(label) => `Dia ${label}`}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    padding: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Vendas"
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#8B5CF6" }}
                  activeDot={{ r: 4, stroke: "#8B5CF6", strokeWidth: 1, fill: "#8B5CF6" }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>
            Visualização do desempenho de vendas diário do mês atual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
