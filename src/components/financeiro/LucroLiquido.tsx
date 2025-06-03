
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Minus, Plus, Users } from "lucide-react";
import { useSalesData } from "@/hooks/financeiro/useSalesData";
import { useCosts } from "@/hooks/financeiro/useCosts";
import { useCommissions } from "@/hooks/financeiro/useCommissions";
import { MonthSelector } from "./MonthSelector";
import { DailyProfitChart } from "./charts/DailyProfitChart";
import { CommissionChart } from "./charts/CommissionChart";

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
  const { costs, loading: costsLoading, fetchCosts } = useCosts();
  const { commissions, totalCommissions, loading: commissionsLoading } = useCommissions(selectedMonth, selectedYear);

  // Simplificar o useEffect para evitar loops infinitos
  useEffect(() => {
    if (refreshTrigger) {
      fetchCosts();
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
    // Filtrar vendas do mês selecionado
    const filteredSales = salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === selectedMonth && saleDate.getFullYear() === selectedYear;
    });

    const monthlyRevenue = filteredSales.reduce((total, sale) => total + Number(sale.gross_amount), 0);

    // Calcular custos fixos
    const totalFixedCosts = costs
      .filter(cost => cost.type === 'fixed')
      .reduce((total, cost) => total + Number(cost.amount), 0);

    // Calcular custos variáveis (incluindo comissões automáticas)
    const totalVariableCosts = costs
      .filter(cost => cost.type === 'variable')
      .reduce((total, cost) => total + Number(cost.amount), 0);

    const totalCosts = totalFixedCosts + totalVariableCosts + totalCommissions;

    // Calcular lucro líquido
    const netProfit = monthlyRevenue - totalCosts;
    const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

    return {
      monthlyRevenue,
      totalFixedCosts,
      totalVariableCosts,
      totalCommissions,
      totalCosts,
      netProfit,
      profitMargin,
      filteredSales
    };
  }, [salesData, costs, totalCommissions, selectedMonth, selectedYear]);

  if (salesLoading || costsLoading || commissionsLoading) {
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
      description: "Fixos + Variáveis + Comissões",
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
                  Comissões automáticas (5%)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
