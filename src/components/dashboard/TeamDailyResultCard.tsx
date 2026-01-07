
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";
import { useTeamDailySales } from "@/hooks/useTeamDailySales";
import { useCountUp, useCountUpCurrency } from "@/hooks/useCountUp";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamDailyResultCard() {
  const { data, isLoading } = useTeamDailySales();
  
  const animatedSalesCount = useCountUp(data?.totalSales || 0, { 
    duration: 800, 
    enabled: !isLoading 
  });
  
  const animatedAmount = useCountUpCurrency(data?.totalAmount || 0, !isLoading);

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Resultado do Dia</h3>
                <p className="text-xs text-muted-foreground">da equipe</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-0.5">Vendas</p>
                <p className="text-xl font-bold text-foreground">
                  {animatedSalesCount}
                </p>
              </div>
              
              <div className="h-8 w-px bg-border" />
              
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-0.5">Valor Total</p>
                <p className="text-xl font-bold text-success">
                  {animatedAmount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
