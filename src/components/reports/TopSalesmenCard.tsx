
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { Sale } from "@/lib/types";
import { useMemo } from "react";
import { useUsers } from "@/hooks/useUsers";

interface TopSalesmenCardProps {
  salesData: Sale[];
}

export function TopSalesmenCard({ salesData }: TopSalesmenCardProps) {
  const { users } = useUsers();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const topSalesmen = useMemo(() => {
    const salesBySalesperson = salesData.reduce((acc, sale) => {
      const salespersonId = sale.salesperson_id;
      if (!acc[salespersonId]) {
        acc[salespersonId] = {
          id: salespersonId,
          totalValue: 0,
          salesCount: 0
        };
      }
      acc[salespersonId].totalValue += sale.gross_amount;
      acc[salespersonId].salesCount += 1;
      return acc;
    }, {} as Record<string, { id: string; totalValue: number; salesCount: number }>);

    return Object.values(salesBySalesperson)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3)
      .map((item, index) => {
        const user = users.find(u => u.id === item.id);
        return {
          ...item,
          name: user?.name || 'Vendedor não encontrado',
          position: index + 1
        };
      });
  }, [salesData, users]);

  const getIcon = (position: number) => {
    switch (position) {
      case 1: return Trophy;
      case 2: return Medal;
      case 3: return Award;
      default: return Award;
    }
  };

  const getColor = (position: number) => {
    switch (position) {
      case 1: return "text-yellow-600 dark:text-yellow-400";
      case 2: return "text-gray-500 dark:text-gray-400";
      case 3: return "text-amber-600 dark:text-amber-400";
      default: return "text-gray-400";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Top Vendedores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {topSalesmen.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum vendedor encontrado no período
            </p>
          ) : (
            topSalesmen.map((salesman) => {
              const Icon = getIcon(salesman.position);
              const color = getColor(salesman.position);
              
              return (
                <div key={salesman.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <div>
                      <p className="font-medium text-sm">{salesman.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {salesman.salesCount} vendas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(salesman.totalValue)}</p>
                    <Badge variant="outline" className="text-xs">
                      #{salesman.position}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
