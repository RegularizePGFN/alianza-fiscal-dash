
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CircleDollarSign, ShoppingCart, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useCountUp, useCountUpCurrency } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface DailySummaryCardProps {
  todaySales: Sale[];
  currentDate: string;
  previousDaySales?: Sale[];
}

export function DailySummaryCard({ todaySales, currentDate, previousDaySales = [] }: DailySummaryCardProps) {
  const totalSalesCount = todaySales.length;
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);

  const prevDaySalesCount = previousDaySales.length;
  const prevDaySalesAmount = previousDaySales.reduce((sum, sale) => sum + sale.gross_amount, 0);

  const salesCountTrend = prevDaySalesCount > 0 
    ? ((totalSalesCount - prevDaySalesCount) / prevDaySalesCount) * 100
    : null;
  const salesAmountTrend = prevDaySalesAmount > 0 
    ? ((totalSalesAmount - prevDaySalesAmount) / prevDaySalesAmount) * 100
    : null;
  
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
    
    const total = todaySales.length;
    return Object.keys(breakdown).map(method => ({
      method: method as PaymentMethod,
      count: breakdown[method as PaymentMethod].count,
      amount: breakdown[method as PaymentMethod].amount,
      percentage: total > 0 ? (breakdown[method as PaymentMethod].count / total) * 100 : 0
    })).filter(item => item.count > 0);
  }, [todaySales]);

  const paymentMethodColors: Record<PaymentMethod, string> = {
    [PaymentMethod.PIX]: "bg-emerald-500",
    [PaymentMethod.BOLETO]: "bg-amber-500",
    [PaymentMethod.CREDIT]: "bg-violet-500",
    [PaymentMethod.DEBIT]: "bg-blue-500"
  };

  const animatedCount = useCountUp(totalSalesCount);
  const animatedAmount = useCountUpCurrency(totalSalesAmount);

  const TrendBadge = ({ value }: { value: number | null }) => {
    if (value === null) return null;
    const isPositive = value >= 0;
    return (
      <span className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded",
        isPositive 
          ? "text-success bg-success/10" 
          : "text-destructive bg-destructive/10"
      )}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(value).toFixed(0)}%
      </span>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-0 shadow-sm hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--kpi-blue)/0.1)]">
                <CalendarDays className="h-4 w-4 text-[hsl(var(--kpi-blue))]" />
              </div>
              <CardTitle className="text-sm font-medium">
                Resumo do Dia
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {currentDate}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Vendas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{animatedCount}</span>
                <TrendBadge value={salesCountTrend} />
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Valor Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{animatedAmount}</span>
                <TrendBadge value={salesAmountTrend} />
              </div>
            </div>
          </div>
          
          {/* Payment Methods */}
          {paymentMethodBreakdown.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Formas de Pagamento</p>
              <div className="space-y-2">
                {paymentMethodBreakdown.map((item) => (
                  <div key={item.method} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-14">{item.method}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("h-full rounded-full", paymentMethodColors[item.method])}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono w-16 text-right">
                      {item.count}x • {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
