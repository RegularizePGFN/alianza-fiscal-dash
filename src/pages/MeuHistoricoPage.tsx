
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { useSales } from "@/hooks/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportsMetricsCards } from "@/components/reports/ReportsMetricsCards";
import { PaymentMethodSummaryCards } from "@/components/reports/PaymentMethodSummaryCards";
import { SalesVolumeChart } from "@/components/reports/SalesVolumeChart";
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, Target, Award } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sale } from "@/lib/types";
import { motion } from "framer-motion";

export default function MeuHistoricoPage() {
  const { user } = useAuth();
  const { sales, loading } = useSales();
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());

  // Filtrar apenas as vendas do vendedor logado
  const mySales = useMemo(() => {
    if (!user) return [];
    return sales.filter(sale => sale.salesperson_id === user.id);
  }, [sales, user]);

  // Filtrar vendas pelo mês selecionado
  const filteredSales = useMemo(() => {
    const startDate = startOfMonth(selectedMonthDate);
    const endDate = endOfMonth(selectedMonthDate);
    
    return mySales.filter(sale => {
      try {
        const saleDate = parseISO(sale.sale_date);
        return isWithinInterval(saleDate, { start: startDate, end: endDate });
      } catch {
        return false;
      }
    });
  }, [mySales, selectedMonthDate]);

  // Calcular métricas de evolução mensal
  const monthlyEvolution = useMemo(() => {
    const months: { month: string; sales: Sale[]; total: number; count: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const startDate = startOfMonth(monthDate);
      const endDate = endOfMonth(monthDate);
      
      const monthSales = mySales.filter(sale => {
        try {
          const saleDate = parseISO(sale.sale_date);
          return isWithinInterval(saleDate, { start: startDate, end: endDate });
        } catch {
          return false;
        }
      });
      
      months.push({
        month: format(monthDate, 'MMM/yy', { locale: ptBR }),
        sales: monthSales,
        total: monthSales.reduce((sum, s) => sum + s.gross_amount, 0),
        count: monthSales.length
      });
    }
    
    return months;
  }, [mySales]);

  const handlePreviousMonth = () => {
    setSelectedMonthDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedMonthDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= new Date()) {
      setSelectedMonthDate(nextMonth);
    }
  };

  const currentMonthLabel = format(selectedMonthDate, 'MMMM yyyy', { locale: ptBR });
  const isCurrentMonth = format(selectedMonthDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular melhor mês
  const bestMonth = useMemo(() => {
    if (monthlyEvolution.length === 0) return null;
    return monthlyEvolution.reduce((best, current) => 
      current.total > best.total ? current : best
    );
  }, [monthlyEvolution]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col space-y-6 p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meu Histórico de Vendas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe sua evolução e resultados mensais
            </p>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-[160px] justify-center">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium capitalize">{currentMonthLabel}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total do Mês
              </CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(filteredSales.reduce((sum, s) => sum + s.gross_amount, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                em {format(selectedMonthDate, 'MMMM', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas Realizadas
              </CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredSales.length}
              </div>
              <p className="text-xs text-muted-foreground">
                transações no período
              </p>
            </CardContent>
          </Card>

          {bestMonth && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Melhor Mês
                </CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(bestMonth.total)}
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {bestMonth.month} ({bestMonth.count} vendas)
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReportsMetricsCards salesData={filteredSales} />
        </motion.div>

        {/* Payment Method Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Resumo por Método de Pagamento
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Distribuição das suas vendas por forma de pagamento
            </p>
          </div>
          <PaymentMethodSummaryCards salesData={filteredSales} />
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <SalesVolumeChart salesData={filteredSales} />
          
          {/* Monthly Evolution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolução Mensal (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyEvolution.map((month, index) => {
                  const maxTotal = Math.max(...monthlyEvolution.map(m => m.total));
                  const percentage = maxTotal > 0 ? (month.total / maxTotal) * 100 : 0;
                  
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{month.month}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(month.total)} ({month.count} vendas)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                          className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
