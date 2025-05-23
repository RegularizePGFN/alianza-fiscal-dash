
import { formatCurrency, formatPercentage, parseISODateString } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Sale, UserRole } from '@/lib/types';
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from '@/lib/constants';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { format, isWeekend, eachDayOfInterval, isSameMonth, startOfMonth, endOfMonth, isAfter } from 'date-fns';

interface CommissionCardProps {
  totalSales: number;
  goalAmount: number;
  salesData: Sale[];
}

export function CommissionCard({
  totalSales,
  goalAmount,
  salesData
}: CommissionCardProps) {
  const {
    user
  } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  // Se for admin, não calculamos a comissão
  if (isAdmin) {
    return <Card className="h-full">
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
      </Card>;
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

  // Gerar todos os dias úteis do mês atual até o dia de hoje
  const dailyData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Gerar intervalo de dias do primeiro dia do mês até hoje
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const today = new Date();
    
    // Pegar todos os dias do mês até hoje (não incluir dias futuros)
    const allDaysInterval = eachDayOfInterval({ 
      start: monthStart, 
      end: isAfter(today, monthEnd) ? monthEnd : today 
    });
    
    // Filtrar apenas dias úteis (excluir fins de semana)
    const businessDays = allDaysInterval.filter(day => !isWeekend(day));
    
    // Criar objeto com dias úteis inicializados com valor zero
    const businessDaysMap: Record<string, {
      day: string;
      value: number;
      count: number;
      date: string;
      formattedDate: string; // Adicionando dia formatado para exibição
    }> = {};
    
    businessDays.forEach(day => {
      const isoDate = format(day, 'yyyy-MM-dd');
      const dayNumber = format(day, 'dd');
      const formattedDate = format(day, 'dd/MM');
      
      businessDaysMap[isoDate] = {
        day: dayNumber,
        value: 0,
        count: 0,
        date: isoDate,
        formattedDate: formattedDate
      };
    });
    
    // Filtrar vendas do mês atual
    const currentMonthSales = filteredSalesData.filter(sale => {
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const saleDate = new Date(sale.sale_date);
        return isSameMonth(saleDate, now) && saleDate.getFullYear() === currentYear;
      }
      return false;
    });
    
    // Preencher os dias que têm vendas com os valores corretos
    currentMonthSales.forEach(sale => {
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const saleDate = sale.sale_date;
        
        // Verificar se a data da venda está no mapa de dias úteis
        if (businessDaysMap[saleDate]) {
          businessDaysMap[saleDate].value += sale.gross_amount;
          businessDaysMap[saleDate].count += 1;
        }
      }
    });
    
    // Converter para array e ordenar por data
    return Object.values(businessDaysMap).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  }, [filteredSalesData]);

  // Calcular o total de vendas e quantidade
  const totals = useMemo(() => {
    const totalDailySales = dailyData.reduce((sum, item) => sum + item.value, 0);
    const totalCount = dailyData.reduce((sum, item) => sum + item.count, 0);
    const daysWithSales = dailyData.filter(day => day.count > 0).length;
    const totalDays = dailyData.length;
    
    const averageSalesAmount = totalCount > 0 ? totalDailySales / totalCount : 0;
    const averageContractsPerDay = daysWithSales > 0 ? totalCount / daysWithSales : 0;
    
    return {
      totalDailySales,
      totalCount,
      averageSalesAmount,
      averageContractsPerDay,
      daysWithSales,
      totalBusinessDays: totalDays
    };
  }, [dailyData]);

  // Formatar dados para o tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === "Vendas") {
      return formatCurrency(value);
    }
    return value;
  };
  
  return <Card className="h-full">
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
          {isCommissionGoalMet ? <p>
              Parabéns! Você atingiu a meta de comissão e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
            </p> : <p>
              Taxa atual: {formatPercentage(commissionRate)}. 
              Atinja R$ {COMMISSION_GOAL_AMOUNT.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
            </p>}
        </div>
        
        {/* Seção de resultado diário */}
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Consolidado Mês</h3>
          
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-base font-semibold">{formatCurrency(totals.totalDailySales)}</span>
              <span className="text-xs text-muted-foreground">
                Média: {formatCurrency(totals.averageSalesAmount)}/venda
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-muted-foreground">
                {totals.totalCount} contratos em {totals.daysWithSales} de {totals.totalBusinessDays} dias úteis
              </span>
              <span className="text-xs text-muted-foreground">
                Média: {totals.averageContractsPerDay.toFixed(1)} contratos/dia
              </span>
            </div>
          </div>
          
          <div className="w-full h-32 overflow-hidden">
            <ChartContainer config={{
              sales: {
                color: '#8B5CF6' // Cor primária para vendas (valor)
              },
              count: {
                color: '#2DD4BF' // Cor para quantidade de contratos
              }
            }} className="w-full h-full">
              <ResponsiveContainer width="99%" height="99%">
                <LineChart data={dailyData} margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: 5
                }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="formattedDate" tick={{
                    fontSize: 10
                  }} tickMargin={5} />
                  <YAxis yAxisId="left" tickFormatter={value => `${value > 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} tick={{
                    fontSize: 10
                  }} width={30} />
                  <YAxis yAxisId="right" orientation="right" tick={{
                    fontSize: 10
                  }} width={20} domain={[0, 'dataMax + 1']} />
                  <Tooltip 
                    formatter={formatTooltip} 
                    labelFormatter={label => `Dia ${label}`} 
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
                    dot={{
                      r: 2,
                      fill: "#8B5CF6"
                    }} 
                    activeDot={{
                      r: 4,
                      stroke: "#8B5CF6",
                      strokeWidth: 1,
                      fill: "#8B5CF6"
                    }} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Contratos" 
                    yAxisId="right" 
                    stroke="#2DD4BF" 
                    strokeWidth={2} 
                    dot={{
                      r: 2,
                      fill: "#2DD4BF"
                    }} 
                    activeDot={{
                      r: 4,
                      stroke: "#2DD4BF",
                      strokeWidth: 1,
                      fill: "#2DD4BF"
                    }} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>;
}
