
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { UserRole, Sale } from '@/lib/types';
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from '@/lib/constants';
import { useMemo } from 'react';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

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
  
  // IMPORTANTE: Para vendedores, usamos o COMMISSION_GOAL_AMOUNT fixo e não a meta pessoal
  const commissionRate = totalSales >= COMMISSION_GOAL_AMOUNT ? COMMISSION_RATE_ABOVE_GOAL : COMMISSION_RATE_BELOW_GOAL;
  const commissionAmount = totalSales * commissionRate;
  const isCommissionGoalMet = totalSales >= COMMISSION_GOAL_AMOUNT;
  
  // Preparar dados diários para o gráfico (somente vendas do próprio vendedor)
  const dailyData = useMemo(() => {
    if (!salesData.length || !user) return [];
    
    // Filtrar apenas vendas do mês atual e do vendedor atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const salespersonSales = salesData.filter(sale => {
      // Verificar se a data da venda está no formato correto
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Extrair o mês e ano da data da venda
        const [year, month] = sale.sale_date.split('-').map(Number);
        // Verificar se é do vendedor atual e do mês atual
        return sale.salesperson_id === user.id && 
               (month - 1) === currentMonth && 
               year === currentYear;
      }
      return false;
    });
    
    // Agrupar por dia
    const salesByDay: Record<string, { day: string, value: number, count: number, date: string }> = {};
    
    salespersonSales.forEach(sale => {
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
  }, [salesData, user]);
  
  // Calcular totais para o resumo
  const chartSummary = useMemo(() => {
    const totalValue = dailyData.reduce((sum, item) => sum + item.value, 0);
    const totalCount = dailyData.reduce((sum, item) => sum + item.count, 0);
    const daysWithSales = dailyData.length;
    
    const avgSaleAmount = totalCount > 0 ? totalValue / totalCount : 0;
    const avgContractsPerDay = daysWithSales > 0 ? totalCount / daysWithSales : 0;
    
    return {
      totalValue,
      totalCount,
      daysWithSales,
      avgSaleAmount,
      avgContractsPerDay
    };
  }, [dailyData]);
  
  // Formatar valores para o tooltip
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
        
        {dailyData.length > 0 && (
          <div className="mt-4 space-y-4">
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
            
            <div className="text-sm text-muted-foreground flex justify-between">
              <div>
                <span className="font-medium">{chartSummary.totalCount} contratos</span> em {chartSummary.daysWithSales} dias
              </div>
              <div>
                Média: {formatCurrency(chartSummary.avgSaleAmount)}/venda
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
