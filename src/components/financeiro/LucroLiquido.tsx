
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calculator } from "lucide-react";
import { useCosts } from "@/hooks/financeiro/useCosts";
import { useSalesData } from "@/hooks/financeiro/useSalesData";

interface LucroLiquidoProps {
  refreshTrigger?: number;
  detailed?: boolean;
}

export function LucroLiquido({ refreshTrigger, detailed = false }: LucroLiquidoProps) {
  const { costs, fetchCosts } = useCosts();
  const { salesData, fetchSalesData } = useSalesData();

  useEffect(() => {
    fetchCosts();
    fetchSalesData();
  }, [refreshTrigger]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular totais
  const totalFixedCosts = costs.filter(cost => cost.type === 'fixed' && cost.is_active)
    .reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);

  const totalVariableCosts = costs.filter(cost => cost.type === 'variable' && cost.is_active)
    .reduce((sum, cost) => sum + parseFloat(cost.amount || 0), 0);

  const totalCosts = totalFixedCosts + totalVariableCosts;

  // Receita total do mês atual
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = salesData
    .filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === currentMonth && saleDate.getFullYear() === currentYear;
    })
    .reduce((sum, sale) => sum + parseFloat(sale.gross_amount || 0), 0);

  const netProfit = monthlyRevenue - totalCosts;
  const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas do mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCosts)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fixos + Variáveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita - Custos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              % da receita
            </p>
          </CardContent>
        </Card>
      </div>

      {detailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Breakdown de Custos</CardTitle>
              <CardDescription>Distribuição dos custos por tipo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Custos Fixos</Badge>
                </div>
                <span className="font-semibold">{formatCurrency(totalFixedCosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Custos Variáveis</Badge>
                </div>
                <span className="font-semibold">{formatCurrency(totalVariableCosts)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalCosts)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
              <CardDescription>Indicadores chave de performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Ponto de Equilíbrio</span>
                <span className="font-semibold">{formatCurrency(totalCosts)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Resultado Operacional</span>
                <span className={`font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfit >= 0 ? 'Lucro' : 'Prejuízo'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Financeiro</span>
                <Badge variant={netProfit >= 0 ? 'default' : 'destructive'}>
                  {netProfit >= 0 ? 'Saudável' : 'Atenção'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
