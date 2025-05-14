
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CircleDollarSign, Users, CalendarDays } from "lucide-react";

interface DailySummaryCardProps {
  todaySales: Sale[];
  currentDate: string;
}

export function DailySummaryCard({ todaySales, currentDate }: DailySummaryCardProps) {
  // Calculate totals
  const totalSalesCount = todaySales.length;
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);
  
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <CalendarDays className="h-4 w-4 text-purple-600" />
          <span>Resumo do Dia</span>
          <span className="text-xs ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            {currentDate}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 rounded-md p-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Users className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total de Vendas</p>
              <h4 className="text-xl font-bold">{totalSalesCount}</h4>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-md p-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <CircleDollarSign className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total em Valor</p>
              <h4 className="text-xl font-bold">{formatCurrency(totalSalesAmount)}</h4>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
