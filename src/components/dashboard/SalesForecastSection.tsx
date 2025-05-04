
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesForecastSectionProps {
  salesData: Sale[];
}

// Função helper para capitalizar primeira letra
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function SalesForecastSection({ salesData }: SalesForecastSectionProps) {
  // Agrupar vendas por mês para análise de tendência
  const monthlySales = salesData.reduce((acc: Record<string, number>, sale) => {
    const date = parseISO(sale.sale_date);
    const monthKey = format(date, "yyyy-MM");
    
    if (!acc[monthKey]) {
      acc[monthKey] = 0;
    }
    
    acc[monthKey] += sale.gross_amount;
    
    return acc;
  }, {});
  
  // Obter meses ordenados
  const months = Object.keys(monthlySales).sort();
  
  // Preparar dados para gráfico
  const chartData = months.map(month => {
    const date = startOfMonth(parseISO(`${month}-01`));
    return {
      month: format(date, "MMM", { locale: ptBR }),
      value: monthlySales[month],
      date: date,
      formattedDate: capitalize(format(date, "MMMM/yyyy", { locale: ptBR }))
    };
  });
  
  // Calcular média móvel para previsão
  const calculateForecast = () => {
    if (chartData.length < 3) return [];
    
    // Usar últimos 3 meses para prever próximos 3 meses
    const lastMonths = chartData.slice(-3);
    const averageGrowth = lastMonths.length > 1
      ? (lastMonths[lastMonths.length - 1].value - lastMonths[0].value) / (lastMonths.length - 1)
      : 0;
    
    const lastValue = lastMonths[lastMonths.length - 1].value;
    const lastDate = lastMonths[lastMonths.length - 1].date;
    
    // Gerar próximos 3 meses com previsão
    return Array(3).fill(0).map((_, index) => {
      const forecastDate = addMonths(lastDate, index + 1);
      const forecastValue = Math.max(0, lastValue + (averageGrowth * (index + 1)));
      
      return {
        month: format(forecastDate, "MMM", { locale: ptBR }),
        value: 0, // Valor real é zero para meses futuros
        forecast: forecastValue, // Valor previsto
        date: forecastDate,
        formattedDate: capitalize(format(forecastDate, "MMMM/yyyy", { locale: ptBR }))
      };
    });
  };
  
  // Combinar dados reais e previstos
  const combinedData = [...chartData, ...calculateForecast()];
  
  // Personalizar tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border p-3 rounded-lg shadow-sm">
          <p className="font-semibold">{data.formattedDate}</p>
          
          {payload[0].name === 'value' && (
            <p className="text-sm text-foreground">
              <span className="opacity-70">Valor total:</span> {formatCurrency(data.value)}
            </p>
          )}
          
          {data.forecast !== undefined && (
            <p className="text-sm text-blue-500 dark:text-blue-400">
              <span className="opacity-70">Previsão:</span> {formatCurrency(data.forecast)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Verificar se temos dados suficientes para mostrar a previsão
  if (combinedData.length < 4) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 rounded-t-lg">
        <CardTitle>Previsão de Vendas</CardTitle>
        <CardDescription>
          Projeção de vendas para os próximos meses com base no histórico
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={combinedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value, { notation: 'compact' })}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorValue)" 
                fillOpacity={0.6}
                name="Valor real"
              />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#3B82F6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorForecast)" 
                fillOpacity={0.6}
                name="Previsão"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-muted-foreground">Vendas realizadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Previsão</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
