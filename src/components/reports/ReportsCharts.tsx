import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sale } from "@/lib/types";
import { BarChart, BarChartHorizontal, Pie, LineChart } from "@/components/reports/charts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReportsChartsProps {
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
}

export function ReportsCharts({ salesData, loading, error }: ReportsChartsProps) {
  const [chartView, setChartView] = useState<string>("monthly");
  const isMobile = useIsMobile();
  
  // Show loading state
  if (loading) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center">
        <CardContent>
          <LoadingSpinner className="text-primary" />
          <p className="text-center mt-4 text-muted-foreground">Carregando dados...</p>
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

  const chartHeight = isMobile ? "300px" : "400px";
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Tabs defaultValue="monthly" onValueChange={setChartView} className="w-full">
        <ScrollArea className="w-full pb-2">
          <TabsList className="inline-flex w-auto mb-2 px-1">
            <TabsTrigger value="monthly" className="px-4">Diário</TabsTrigger>
            <TabsTrigger value="payment" className="px-4">Por Pagamento</TabsTrigger>
            <TabsTrigger value="salesperson" className="px-4">Por Vendedor</TabsTrigger>
          </TabsList>
        </ScrollArea>
        
        <div className="mt-4">
          <TabsContent value="monthly" className="space-y-6 m-0">
            <Card className="shadow-md border-primary/10 hover:border-primary/20 transition-all">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 rounded-t-lg">
                <CardTitle>Vendas por Dia</CardTitle>
                <CardDescription>
                  Volume de vendas distribuído por dias no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent className={`h-[${chartHeight}]`}>
                <LineChart data={salesData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="grid grid-cols-1 lg:grid-cols-2 gap-6 m-0">
            <Card className="shadow-md border-primary/10 hover:border-primary/20 transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-950 rounded-t-lg">
                <CardTitle>Vendas por Método de Pagamento</CardTitle>
                <CardDescription>
                  Distribuição do volume de vendas por método de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className={`h-[${chartHeight}]`}>
                <Pie data={salesData} />
              </CardContent>
            </Card>

            <Card className="shadow-md border-primary/10 hover:border-primary/20 transition-all">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-emerald-950 rounded-t-lg">
                <CardTitle>Valor por Método de Pagamento</CardTitle>
                <CardDescription>
                  Total de vendas por método de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className={`h-[${chartHeight}]`}>
                <BarChartHorizontal data={salesData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salesperson" className="space-y-6 m-0">
            <Card className="shadow-md border-primary/10 hover:border-primary/20 transition-all">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950 rounded-t-lg">
                <CardTitle>Vendas por Vendedor</CardTitle>
                <CardDescription>
                  Comparação de performance entre vendedores
                </CardDescription>
              </CardHeader>
              <CardContent className={`h-[${chartHeight}]`}>
                <BarChart data={salesData} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
