
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useCountUpCurrency } from "@/hooks/useCountUp";

interface DailyResultCardProps {
  salesData: Sale[];
}

export function DailyResultCard({ salesData }: DailyResultCardProps) {
  const dailyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthSales = salesData.filter(sale => {
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month] = sale.sale_date.split('-').map(Number);
        return month - 1 === currentMonth && year === currentYear;
      }
      return false;
    });
    
    const salesByDay: Record<string, { day: string, value: number, count: number, date: string }> = {};
    
    currentMonthSales.forEach(sale => {
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dayKey = sale.sale_date.split('-')[2];
        const formattedDay = dayKey;
        
        if (!salesByDay[dayKey]) {
          salesByDay[dayKey] = {
            day: formattedDay,
            value: 0,
            count: 0,
            date: sale.sale_date
          };
        }
        
        salesByDay[dayKey].value += sale.gross_amount;
        salesByDay[dayKey].count += 1;
      }
    });
    
    return Object.values(salesByDay).sort((a, b) => 
      parseInt(a.day) - parseInt(b.day)
    );
  }, [salesData]);
  
  const totals = useMemo(() => {
    const totalSales = dailyData.reduce((sum, item) => sum + item.value, 0);
    const totalCount = dailyData.reduce((sum, item) => sum + item.count, 0);
    const averageSalesAmount = totalCount > 0 ? totalSales / totalCount : 0;
    const averageContractsPerDay = dailyData.length > 0 ? totalCount / dailyData.length : 0;
    return { totalSales, totalCount, averageSalesAmount, averageContractsPerDay, daysWithSales: dailyData.length };
  }, [dailyData]);

  const animatedTotal = useCountUpCurrency(totals.totalSales);
  const animatedAverage = useCountUpCurrency(totals.averageSalesAmount);

  const formatTooltip = (value: number, name: string) => {
    if (name === "Vendas") {
      return formatCurrency(value);
    }
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-0 shadow-sm hover-lift">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--kpi-green)/0.1)]">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--kpi-green))]" />
              </div>
              <CardTitle className="text-sm font-medium">
                Resultado Diário
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">
              Mês Atual
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-2xl font-bold">{animatedTotal}</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Média: {animatedAverage}/venda
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">{totals.totalCount} contratos</span>
              <p className="text-xs text-muted-foreground">
                em {totals.daysWithSales} dias
              </p>
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-36">
            <ChartContainer
              config={{
                sales: { color: 'hsl(var(--chart-1))' },
                count: { color: 'hsl(var(--chart-2))' }
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={dailyData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip
                    formatter={formatTooltip}
                    labelFormatter={(label) => `Dia ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "12px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Vendas"
                    yAxisId="left"
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
