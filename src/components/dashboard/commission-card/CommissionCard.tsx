import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { COMMISSION_GOAL_AMOUNT, CONTRACT_TYPE_PJ } from "@/lib/constants";
import { calculateCommission } from "@/lib/utils";
import { SalesChart } from "./SalesChart";
import { MonthlySummary } from "./MonthlySummary";
import { CommissionSummary } from "./CommissionSummary";
import { generateDailyData, calculateTotals } from "./utils";
import { supabase } from "@/integrations/supabase/client";

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
  const [contractType, setContractType] = useState<string>(CONTRACT_TYPE_PJ);

  // Fetch user's contract type from profiles table
  useEffect(() => {
    const fetchContractType = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("contract_type")
          .eq("id", user.id)
          .single();
          
        if (profile?.contract_type) {
          setContractType(profile.contract_type);
        }
      } catch (error) {
        console.error("Error fetching contract type:", error);
        // Keep default CONTRACT_TYPE_PJ if error
      }
    };
    
    fetchContractType();
  }, [user?.id]);

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

  // Calculate commission based on user's actual contract type
  const commission = calculateCommission(totalSales, contractType);
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
          Comissão Projetada ({contractType})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CommissionSummary
          commissionAmount={commission.amount}
          commissionRate={commission.rate}
          isCommissionGoalMet={isCommissionGoalMet}
          contractType={contractType}
        />
        
        {/* Monthly summary section */}
        <MonthlySummary totals={totals} />
        
        {/* Chart section */}
        <SalesChart dailyData={dailyData} />
      </CardContent>
    </Card>
  );
}
