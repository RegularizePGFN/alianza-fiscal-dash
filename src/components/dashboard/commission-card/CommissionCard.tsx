
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from "@/lib/constants";
import { SalesChart } from "./SalesChart";
import { MonthlySummary } from "./MonthlySummary";
import { CommissionSummary } from "./CommissionSummary";
import { generateDailyData, calculateTotals } from "./utils";

interface CommissionCardProps {
  totalSales: number;
  goalAmount: number;
  salesData: Sale[];
}

export function CommissionCard({
  totalSales,
  goalAmount,
  salesData
}: CommissionCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  // If admin, we don't calculate commission
  if (isAdmin) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              As informações de comissão são disponíveis apenas para os vendedores individuais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // IMPORTANT: For salespeople, we use the fixed COMMISSION_GOAL_AMOUNT, not the personal goal
  const commissionRate = totalSales >= COMMISSION_GOAL_AMOUNT ? COMMISSION_RATE_ABOVE_GOAL : COMMISSION_RATE_BELOW_GOAL;
  const commissionAmount = totalSales * commissionRate;
  const isCommissionGoalMet = totalSales >= COMMISSION_GOAL_AMOUNT;

  // Generate daily data for the chart
  const dailyData = useMemo(() => 
    generateDailyData(salesData, user?.id), 
  [salesData, user]);

  // Calculate the totals
  const totals = useMemo(() => 
    calculateTotals(dailyData),
  [dailyData]);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Comissão Projetada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CommissionSummary
          commissionAmount={commissionAmount}
          commissionRate={commissionRate}
          isCommissionGoalMet={isCommissionGoalMet}
        />
        
        {/* Monthly summary section */}
        <MonthlySummary totals={totals} />
        
        {/* Chart section */}
        <SalesChart dailyData={dailyData} />
      </CardContent>
    </Card>
  );
}
