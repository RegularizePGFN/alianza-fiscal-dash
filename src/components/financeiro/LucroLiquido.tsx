
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Minus, Plus, Users } from "lucide-react";
import { useSalesData } from "@/hooks/financeiro/useSalesData";
import { useFixedCosts } from "@/hooks/financeiro/useFixedCosts";
import { useVariableCosts } from "@/hooks/financeiro/useVariableCosts";
import { useCommissions } from "@/hooks/financeiro/useCommissions";
import { MonthSelector } from "./MonthSelector";
import { DailyProfitChart } from "./charts/DailyProfitChart";
import { CommissionChart } from "./charts/CommissionChart";
import { startOfMonth, endOfMonth } from "date-fns";

interface LucroLiquidoProps {
  refreshTrigger?: number;
  detailed?: boolean;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export function LucroLiquido({ 
  refreshTrigger, 
  detailed = false, 
  selectedMonth, 
  selectedYear, 
  onMonthChange 
}: LucroLiquidoProps) {
  const { salesData, loading: salesLoading } = useSalesData();
  
  // Usar os MESMOS hooks que as abas de gerenciamento usam
  const { costs: fixedCosts, loading: fixedCostsLoading } = useFixedCosts();
  
  // Criar string do mês no formato que o hook espera (YYYY-MM)
  const monthString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
  const { costs: variableCosts, loading: variableCostsLoading } = useVariableCosts(monthString);
  
  const { commissions, totalCommissions, loading: commissionsLoading } = useCommissions(selectedMonth, selectedYear);

  // Simplificar o useEffect para evitar loops infinitos
  useEffect(() => {
    if (refreshTrigger) {
      console.log('RefreshTrigger activated, data will be refreshed automatically by hooks');
    }
  }, [refreshTrigger]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Memoizar cálculos para evitar recálculos desnecessários
  const calculations = useMemo(() => {
    // Usar a mesma lógica dos relatórios para filtrar vendas
    const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);
    
    // Converter datas para string no formato YYYY-MM-DD para comparação
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`Financeiro - Filtrando vendas de ${startDateStr} até ${endDateStr}`);
    
    const filteredSales = salesData.filter(sale => {
      // Garantir que sale_date está no formato correto
      if (typeof sale.sale_date !== 'string' || !sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.warn(`Data de venda inválida: ${sale.sale_date} para venda ${sale.id}`);
        return false;
      }
      
      // Comparar datas como strings no formato YYYY-MM-DD
      return sale.sale_date >= startDateStr && sale.sale_date <= endDateStr;
    });

    console.log(`Financeiro - Total de vendas filtradas: ${filteredSales.length}`);
    console.log(`Financeiro - Valor total: R$ ${filteredSales.reduce((total, sale) => total + Number(sale.gross_amount), 0).toFixed(2)}`);

    const monthlyRevenue = filteredSales.reduce((total, sale) => total + Number(sale.gross_amount), 0);

    // Calcular custos fixos usando exatamente o MESMO cálculo da aba Gerenciar Custos
    const totalFixedCosts = fixedCosts.reduce((total, cost) => total + Number(cost.amount), 0);
    
    // Calcular custos variáveis usando exatamente o MESMO cálculo da aba Gerenciar Custos  
    const totalVariableCosts = variableCosts.reduce((total, cost) => total + Number(cost.amount), 0);

    console.log(`Financeiro - Custos fixos: R$ ${totalFixedCosts.toFixed(2)}`);
    console.log(`Financeiro - Custos variáveis (${monthString}): R$ ${totalVariableCosts.toFixed(2)}`);
    console.log(`Financeiro - Comissões: R$ ${totalCommissions.toFixed(2)}`);

    // Custo total = custos fixos + custos variáveis (SEM comissões, pois elas aparecem separadamente)
    const totalCosts = totalFixedCosts + totalVariableCosts;

    // Calcular lucro líquido (receita - custos - comissões)
    const netProfit = monthlyRevenue - totalCosts - totalCommissions;
    const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

    return {
      monthlyRevenue,
      totalFixedCosts,
      totalVariableCosts,
      totalCommissions, // Restaurar comissões para aparecer na visão geral
      totalCosts,
      netProfit,
      profitMargin,
      filteredSales
    };
  }, [salesData, fixedCosts, variableCosts, totalCommissions, selectedMonth, selectedYear, monthString]);

  if (salesLoading || fixedCostsLoading || variableCostsLoading || commissionsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Receita Mensal",
      value: calculations.monthlyRevenue,
      description: "Vendas do mês selecionado",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Custos Totais",
      value: calculations.totalCosts,
      description: "Fixos + Variáveis (sem comissões)",
      icon: Minus,
      color: "text-red-600"
    },
    {
      title: "Lucro Líquido",
      value: calculations.netProfit,
      description: "Receita - Custos",
      icon: calculations.netProfit >= 0 ? TrendingUp : Minus,
      color: calculations.netProfit >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Margem de Lucro",
      value: calculations.profitMargin,
      description: "% da receita",
      icon: TrendingUp,
      color: calculations.profitMargin >= 0 ? "text-green-600" : "text-red-600",
      isPercentage: true
    }
  ];

  return (
    <div className="space-y-6">
      <MonthSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={onMonthChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.isPercentage 
                  ? `${card.value.toFixed(1)}%`
                  : formatCurrency(card.value)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {detailed && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyProfitChart
              salesData={calculations.filteredSales}
              totalCosts={calculations.totalCosts}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
            <CommissionChart commissions={commissions} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-red-600" />
                  Custos Fixos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(calculations.totalFixedCosts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Custos mensais recorrentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-orange-600" />
                  Custos Variáveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(calculations.totalVariableCosts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Custos cadastrados variáveis
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Comissões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(calculations.totalCommissions)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comissões do mês selecionado
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
