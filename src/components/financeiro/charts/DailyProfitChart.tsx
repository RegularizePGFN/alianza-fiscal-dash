
import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";

interface DailyProfitChartProps {
  salesData: any[];
  totalCosts: number;
  selectedMonth: number;
  selectedYear: number;
}

export function DailyProfitChart({ salesData, totalCosts, selectedMonth, selectedYear }: DailyProfitChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const chartData = useMemo(() => {
    // Obter quantos dias tem o mês
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyCosts = totalCosts / daysInMonth; // Custos diluídos por dia
    
    // Criar array com todos os dias do mês
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // Calcular receita do dia
      const dailyRevenue = salesData
        .filter(sale => sale.sale_date === dateStr)
        .reduce((total, sale) => total + Number(sale.gross_amount), 0);
      
      const dailyProfit = dailyRevenue - dailyCosts;
      
      return {
        day: day.toString(),
        receita: dailyRevenue,
        custos: dailyCosts,
        lucro: dailyProfit
      };
    });
    
    return days;
  }, [salesData, totalCosts, selectedMonth, selectedYear]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Lucro Diário do Mês
        </CardTitle>
        <CardDescription>
          Evolução do lucro líquido ao longo dos dias do mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          config={{
            receita: { color: '#3B82F6' },
            custos: { color: '#EF4444' },
            lucro: { color: '#10B981' }
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  let label = '';
                  switch(name) {
                    case 'receita':
                      label = 'Receita';
                      break;
                    case 'custos':
                      label = 'Custos';
                      break;
                    case 'lucro':
                      label = 'Lucro';
                      break;
                    default:
                      label = name;
                  }
                  return [formatCurrency(value), label];
                }}
                labelFormatter={(label) => `Dia ${label}`}
                contentStyle={{ 
                  backgroundColor: "white", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receita" 
                name="Receita" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="custos" 
                name="Custos" 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                name="Lucro" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
