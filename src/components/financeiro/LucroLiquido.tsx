
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Minus, Plus } from "lucide-react";
import { useSalesData } from "@/hooks/financeiro/useSalesData";
import { useCosts } from "@/hooks/financeiro/useCosts";

interface LucroLiquidoProps {
  refreshTrigger?: number;
  detailed?: boolean;
}

export function LucroLiquido({ refreshTrigger, detailed = false }: LucroLiquidoProps) {
  const { salesData, loading: salesLoading } = useSalesData();
  const { costs, loading: costsLoading, fetchCosts } = useCosts();

  useEffect(() => {
    if (refreshTrigger) {
      fetchCosts();
    }
  }, [refreshTrigger, fetchCosts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Memoizar cálculos para evitar recálculos desnecessários
  const calculations = useMemo(() => {
    // Calcular receita mensal atual
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = salesData
      .filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate.getMonth() + 1 === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + Number(sale.gross_amount), 0);

    // Calcular custos totais
    const totalFixedCosts = costs
      .filter(cost => cost.type === 'fixed')
      .reduce((total, cost) => total + Number(cost.amount), 0);

    const totalVariableCosts = costs
      .filter(cost => cost.type === 'variable')
      .reduce((total, cost) => total + Number(cost.amount), 0);

    const totalCosts = totalFixedCosts + totalVariableCosts;

    // Calcular lucro líquido
    const netProfit = monthlyRevenue - totalCosts;
    const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

    return {
      monthlyRevenue,
      totalFixedCosts,
      totalVariableCosts,
      totalCosts,
      netProfit,
      profitMargin
    };
  }, [salesData, costs]);

  if (salesLoading || costsLoading) {
    return (
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
    );
  }

  const summaryCards = [
    {
      title: "Receita Mensal",
      value: calculations.monthlyRevenue,
      description: "Vendas do mês atual",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Custos Totais",
      value: calculations.totalCosts,
      description: "Fixos + Variáveis",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Minus className="h-5 w-5 text-red-600" />
                Breakdown de Custos
              </CardTitle>
              <CardDescription>
                Detalhamento dos custos fixos e variáveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Custos Fixos</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(calculations.totalFixedCosts)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Custos Variáveis</span>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(calculations.totalVariableCosts)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total de Custos</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(calculations.totalCosts)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Análise de Rentabilidade
              </CardTitle>
              <CardDescription>
                Indicadores de performance financeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Receita Bruta</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {formatCurrency(calculations.monthlyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Custos (%)</span>
                  <span className="text-sm font-semibold text-red-600">
                    {calculations.monthlyRevenue > 0 ? ((calculations.totalCosts / calculations.monthlyRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <hr />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Lucro Líquido</span>
                  <span className={`font-bold ${calculations.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.netProfit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
