
import { formatCurrency, formatPercentage, calculateCommission, parseISODateString } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { UserRole, Sale } from '@/lib/types';
import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface CommissionCardProps {
  totalSales: number;
  goalAmount: number;
  salesData?: Sale[];
}

export function CommissionCard({ totalSales, goalAmount, salesData = [] }: CommissionCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Se for admin, não calculamos a comissão
  if (isAdmin) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              As informações de comissão são disponíveis apenas para os vendedores individuais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Para vendedores, mantém o comportamento original e adiciona o gráfico
  const { rate: commissionRate, amount: commissionAmount } = calculateCommission(totalSales, goalAmount);
  const isGoalMet = totalSales >= goalAmount;
  
  // Processar dados para o gráfico diário (similar ao DailyResultCard)
  const dailyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar vendas do mês atual
    const currentMonthSales = salesData.filter(sale => {
      // Parse the sale date properly
      const saleDate = typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? parseISODateString(sale.sale_date)
        : new Date(sale.sale_date);
        
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    // Agrupar por dia
    const salesByDay: Record<string, { day: string, value: number, date: string }> = {};
    
    currentMonthSales.forEach(sale => {
      // Parse the sale_date consistently
      const saleDate = typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? parseISODateString(sale.sale_date)
        : new Date(sale.sale_date);
        
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
  
  // Total de vendas do gráfico
  const totalGraphSales = useMemo(() => {
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
          Comissão Projetada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">{formatCurrency(commissionAmount)}</span>
          <span className={`text-lg font-semibold ${isGoalMet ? 'text-af-green-500' : 'text-primary'}`}>
            {formatPercentage(commissionRate)}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground mb-4">
          {isGoalMet ? (
            <p>
              Parabéns! Você atingiu sua meta e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
            </p>
          ) : (
            <p>
              Taxa atual: {formatPercentage(commissionRate)}. 
              Atinja R$ {goalAmount.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
            </p>
          )}
        </div>
        
        {/* Gráfico de vendas diárias */}
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
        
        <div className="text-xs text-muted-foreground mt-2">
          <p>
            Suas vendas diárias do mês atual: {dailyData.length} dias com vendas
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
