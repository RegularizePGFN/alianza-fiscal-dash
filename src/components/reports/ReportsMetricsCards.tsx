
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Target, Calendar } from "lucide-react";
import { Sale } from "@/lib/types";
import { useMemo } from "react";

interface ReportsMetricsCardsProps {
  salesData: Sale[];
}

export function ReportsMetricsCards({ salesData }: ReportsMetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const metrics = useMemo(() => {
    const totalValue = salesData.reduce((sum, sale) => sum + sale.gross_amount, 0);
    const totalSales = salesData.length;
    const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;
    const uniqueSalespeople = new Set(salesData.map(sale => sale.salesperson_id)).size;
    
    // Calculate business days in the period
    const calculateBusinessDays = () => {
      if (salesData.length === 0) return 0;
      
      // Get unique dates from sales data
      const uniqueDates = new Set(salesData.map(sale => sale.sale_date));
      const sortedDates = Array.from(uniqueDates).sort();
      
      if (sortedDates.length === 0) return 0;
      
      const startDate = new Date(sortedDates[0]);
      const endDate = new Date(sortedDates[sortedDates.length - 1]);
      
      let businessDays = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        // Monday = 1, Tuesday = 2, ..., Friday = 5 (exclude Saturday = 6, Sunday = 0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return businessDays;
    };
    
    const businessDays = calculateBusinessDays();
    
    return {
      totalValue,
      totalSales,
      averageTicket,
      uniqueSalespeople,
      businessDays
    };
  }, [salesData]);

  const metricsData = [
    {
      title: "Vendas Totais",
      value: metrics.totalSales.toString(),
      subtitle: "transações realizadas",
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(metrics.averageTicket),
      subtitle: "valor médio por venda",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      title: "Vendedores Ativos",
      value: metrics.uniqueSalespeople.toString(),
      subtitle: "vendedores com vendas",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
      title: "Período",
      value: `${metrics.businessDays} dias`,
      subtitle: "dias úteis no período filtrado",
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric) => (
        <Card key={metric.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metric.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {metric.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
