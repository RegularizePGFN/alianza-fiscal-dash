
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sale } from "@/lib/types";
import { BarChart, BarChartHorizontal, Pie, LineChart } from "@/components/reports/charts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ReportsChartsProps {
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
}

export function ReportsCharts({ salesData, loading, error }: ReportsChartsProps) {
  const [chartView, setChartView] = useState<string>("monthly");
  
  // Show loading state
  if (loading) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center">
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>
          Ocorreu um problema ao carregar os dados dos relatórios. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (salesData.length === 0) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent className="text-center py-10">
          <h3 className="text-xl font-medium mb-2">Nenhum dado encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros para visualizar os dados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Tabs defaultValue="monthly" onValueChange={setChartView}>
        <TabsList className="grid grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="payment">Por Pagamento</TabsTrigger>
          <TabsTrigger value="salesperson">Por Vendedor</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Mês</CardTitle>
                <CardDescription>
                  Volume de vendas distribuído pelos meses do período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <LineChart data={salesData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Método de Pagamento</CardTitle>
                <CardDescription>
                  Distribuição do volume de vendas por método de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Pie data={salesData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor por Método de Pagamento</CardTitle>
                <CardDescription>
                  Total de vendas por método de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChartHorizontal data={salesData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salesperson" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Vendedor</CardTitle>
                <CardDescription>
                  Comparação de performance entre vendedores
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <BarChart data={salesData} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
