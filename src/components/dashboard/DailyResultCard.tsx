import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency, parseISODateString } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
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
    
    // Filtrar vendas do mês atual usando correspondência de string exata para data
    const currentMonthSales = salesData.filter(sale => {
      // Verifica se a sale_date está no formato YYYY-MM-DD e obtém o mês e ano
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month] = sale.sale_date.split('-').map(Number);
        return month - 1 === currentMonth && year === currentYear;
      }
      return false;
    });
    
    console.log(`DailyResultCard: Filtradas ${currentMonthSales.length} vendas para o mês atual (${currentMonth + 1}/${currentYear})`);
    
    // Agrupar por dia
    const salesByDay: Record<string, { day: string, value: number, count: number, date: string }> = {};
    
    currentMonthSales.forEach(sale => {
      // Garantir que estamos trabalhando com o formato correto de data (YYYY-MM-DD)
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dayKey = sale.sale_date.split('-')[2]; // Extrai o dia da data ISO
        const formattedDay = dayKey; // Já está no formato adequado (DD)
        
        if (!salesByDay[dayKey]) {
          salesByDay[dayKey] = {
            day: formattedDay,
            value: 0,
            count: 0,
            date: sale.sale_date
          };
        }
        
        salesByDay[dayKey].value += sale.gross_amount;
        salesByDay[dayKey].count += 1; // Incrementa o contador de vendas
      }
    });
    
    // Converter para array e ordenar por dia
    const result = Object.values(salesByDay).sort((a, b) => 
      parseInt(a.day) - parseInt(b.day)
    );
    
    console.log(`DailyResultCard: Dados agregados por dia: ${result.length} dias com vendas`);
    return result;
  }, [salesData]);
  
  // Calcular o total de vendas e quantidade
  const totals = useMemo(() => {
    const totalSales = dailyData.reduce((sum, item) => sum + item.value, 0);
    const totalCount = dailyData.reduce((sum, item) => sum + item.count, 0);
    // Calculate average sales amount
    const averageSalesAmount = totalCount > 0 ? totalSales / totalCount : 0;
    return { totalSales, totalCount, averageSalesAmount };
  }, [dailyData]);

  // Formatar dados para o tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === "Vendas") {
      return formatCurrency(value);
    }
    return value;
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
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{formatCurrency(totals.totalSales)}</span>
            <span className="text-sm text-muted-foreground">
              Média: {formatCurrency(totals.averageSalesAmount)}/venda
            </span>
          </div>
          <span className="text-lg font-semibold text-muted-foreground">
            {totals.totalCount} contratos em {dailyData.length} dias
          </span>
        </div>
        
        <div className="w-full h-40 overflow-hidden">
          <ChartContainer
            config={{
              sales: {
                color: '#8B5CF6'  // Cor primária para vendas (valor)
              },
              count: {
                color: '#2DD4BF'  // Cor para quantidade de contratos
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
                  yAxisId="left"
                  tickFormatter={(value) => `${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                  tick={{ fontSize: 10 }}
                  width={30}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  width={20}
                  domain={[0, 'dataMax + 1']}
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
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="Vendas"
                  yAxisId="left"
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#8B5CF6" }}
                  activeDot={{ r: 4, stroke: "#8B5CF6", strokeWidth: 1, fill: "#8B5CF6" }}
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Contratos"
                  yAxisId="right"
                  stroke="#2DD4BF" 
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#2DD4BF" }}
                  activeDot={{ r: 4, stroke: "#2DD4BF", strokeWidth: 1, fill: "#2DD4BF" }}
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
