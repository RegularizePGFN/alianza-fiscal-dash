import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useTeamDailySales } from "./useTeamDailySales";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function TeamDailySalesCard() {
  const { totalSales, totalAmount, loading } = useTeamDailySales();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-success/10 via-background to-background border-success/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Vendas da Equipe Hoje
        </CardTitle>
        <Users className="h-5 w-5 text-success" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-3xl font-bold text-success">{totalSales}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success/60" />
          </div>
          
          <div className="pt-4 border-t border-success/20">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Resultado consolidado da equipe no dia
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
