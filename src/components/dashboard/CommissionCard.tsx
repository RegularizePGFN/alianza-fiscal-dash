
import { formatCurrency, formatPercentage, parseISODateString } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Sale, UserRole } from '@/lib/types';
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from '@/lib/constants';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { format } from 'date-fns';

interface CommissionCardProps {
  totalSales: number;
  goalAmount: number;
  salesData: Sale[];
}

export function CommissionCard({ totalSales, goalAmount, salesData }: CommissionCardProps) {
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
  
  // IMPORTANTE: Para vendedores, usamos o COMMISSION_GOAL_AMOUNT fixo e não a meta pessoal
  const commissionRate = totalSales >= COMMISSION_GOAL_AMOUNT ? COMMISSION_RATE_ABOVE_GOAL : COMMISSION_RATE_BELOW_GOAL;
  const commissionAmount = totalSales * commissionRate;
  const isCommissionGoalMet = totalSales >= COMMISSION_GOAL_AMOUNT;
  
  // Filtrar dados de vendas apenas para o vendedor atual
  const filteredSalesData = useMemo(() => {
    if (!user) return [];
    
    return salesData.filter(sale => sale.salesperson_id === user.id);
  }, [salesData, user]);
  
  // Agrupar vendas por dia
  const dailyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar vendas do mês atual
    const currentMonthSales = filteredSalesData.filter(sale => {
      // Verifica se a sale_date está no formato YYYY-MM-DD e obtém o mês e ano
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month] = sale.sale_date.split('-').map(Number);
        return month - 1 === currentMonth && year === currentYear;
      }
      return false;
    });
    
    // Agrupar por dia
    const salesByDay: Record<string, { day: string, value: number, count: number, date: string }> = {};
    
    currentMonthSales.forEach(sale => {
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
        salesByDay[dayKey].count += 1;
      }
    });
    
    // Converter para array e ordenar por dia
    return Object.values(salesByDay).sort((a, b) => 
      parseInt(a.day) - parseInt(b.day)
    );
  }, [filteredSalesData]);
  
  // Calcular o total de vendas e quantidade
  const totals = useMemo(() => {
    const totalDailySales = dailyData.reduce((sum, item) => sum + item.value, 0);
    const totalCount = dailyData.reduce((sum, item) => sum + item.count, 0);
    const averageSalesAmount = totalCount > 0 ? totalDailySales / totalCount : 0;
    const averageContractsPerDay = dailyData.length > 0 ? totalCount / dailyData.length : 0;
    
    return { 
      totalDailySales, 
      totalCount, 
      averageSalesAmount, 
      averageContractsPerDay, 
      daysWithSales: dailyData.length 
    };
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
          Comissão Projetada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">{formatCurrency(commissionAmount)}</span>
          <span className={`text-lg font-semibold ${isCommissionGoalMet ? 'text-af-green-500' : 'text-primary'}`}>
            {formatPercentage(commissionRate)}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {isCommissionGoalMet ? (
            <p>
              Parabéns! Você atingiu a meta de comissão e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
            </p>
          ) : (
            <p>
              Taxa atual: {formatPercentage(commissionRate)}. 
              Atinja R$ {COMMISSION_GOAL_AMOUNT.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
            </p>
          )}
        </div>
        
        {/* Seção de resultado diário */}
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Seu Resultado Diário (Mês Atual)</h3>
          
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-base font-semibold">{formatCurrency(totals.totalDailySales)}</span>
              <span className="text-xs text-muted-foreground">
                Média: {formatCurrency(totals.averageSalesAmount)}/venda
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-muted-foreground">
                {totals.totalCount} contratos em {totals.daysWithSales} dias
              </span>
              <span className="text-xs text-muted-foreground">
                Média: {totals.averageContractsPerDay.toFixed(1)} contratos/dia
              </span>
            </div>
          </div>
          
          <div className="w-full h-32 overflow-hidden">
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
        </div>
      </CardContent>
    </Card>
  );
}
