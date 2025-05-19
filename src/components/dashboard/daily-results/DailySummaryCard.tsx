
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CircleDollarSign, Users, CalendarDays, ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface DailySummaryCardProps {
  todaySales: Sale[];
  currentDate: string;
  previousDaySales?: Sale[];
}

export function DailySummaryCard({ todaySales, currentDate, previousDaySales = [] }: DailySummaryCardProps) {
  // Calculate totals
  const totalSalesCount = todaySales.length;
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);

  // Calculate previous day metrics for comparison
  const prevDaySalesCount = previousDaySales.length;
  const prevDaySalesAmount = previousDaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);

  // Calculate trends
  const salesCountTrend = prevDaySalesCount > 0 
    ? ((totalSalesCount - prevDaySalesCount) / prevDaySalesCount) * 100
    : 0;
  const salesAmountTrend = prevDaySalesAmount > 0 
    ? ((totalSalesAmount - prevDaySalesAmount) / prevDaySalesAmount) * 100
    : 0;
  
  // Payment Method Breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const breakdown = {
      [PaymentMethod.PIX]: { count: 0, amount: 0 },
      [PaymentMethod.BOLETO]: { count: 0, amount: 0 },
      [PaymentMethod.CREDIT]: { count: 0, amount: 0 },
      [PaymentMethod.DEBIT]: { count: 0, amount: 0 }
    };
    
    todaySales.forEach(sale => {
      if (breakdown[sale.payment_method]) {
        breakdown[sale.payment_method].count++;
        breakdown[sale.payment_method].amount += sale.gross_amount;
      }
    });
    
    // Calculate percentages
    const total = todaySales.length;
    return Object.keys(breakdown).map(method => ({
      method: method as PaymentMethod,
      count: breakdown[method as PaymentMethod].count,
      amount: breakdown[method as PaymentMethod].amount,
      percentage: total > 0 ? (breakdown[method as PaymentMethod].count / total) * 100 : 0
    })).filter(item => item.count > 0);
  }, [todaySales]);

  // Colors for payment methods
  const paymentMethodColors = {
    [PaymentMethod.PIX]: "bg-emerald-500 dark:bg-emerald-600",
    [PaymentMethod.BOLETO]: "bg-amber-500 dark:bg-amber-600",
    [PaymentMethod.CREDIT]: "bg-violet-500 dark:bg-violet-600",
    [PaymentMethod.DEBIT]: "bg-blue-500 dark:bg-blue-600"
  };
  
  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Resumo do Dia</span>
          <span className="text-xs ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-full">
            {currentDate}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="grid grid-cols-2 gap-3">
          {/* Total sales count with trend */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800/50">
              <Users className="h-5 w-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-gray-300">Total de Vendas</p>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold dark:text-white">{totalSalesCount}</h4>
                {prevDaySalesCount > 0 && (
                  <div className={`flex items-center text-xs px-1.5 py-0.5 rounded ${salesCountTrend >= 0 ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}>
                    {salesCountTrend >= 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(salesCountTrend).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Total sales amount with trend */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800/50">
              <CircleDollarSign className="h-5 w-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-gray-300">Total em Valor</p>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold dark:text-white">{formatCurrency(totalSalesAmount)}</h4>
                {prevDaySalesAmount > 0 && (
                  <div className={`flex items-center text-xs px-1.5 py-0.5 rounded ${salesAmountTrend >= 0 ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'}`}>
                    {salesAmountTrend >= 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(salesAmountTrend).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Methods Breakdown */}
        {paymentMethodBreakdown.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground dark:text-gray-300 mb-2">Formas de Pagamento</p>
            <div className="space-y-2">
              {paymentMethodBreakdown.map((item) => (
                <div key={item.method} className="flex items-center gap-2">
                  <div className="text-xs w-16 dark:text-gray-300">{item.method}</div>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    <div 
                      className={`h-full ${paymentMethodColors[item.method]}`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-300">
                    {item.count}x ({item.percentage.toFixed(0)}%)
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
