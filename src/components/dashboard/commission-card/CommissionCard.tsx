


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
  const [isLoadingContract, setIsLoadingContract] = useState(true);

  // Extract stable user ID
  const userId = user?.id;

  // Fetch user's contract type from profiles table
  useEffect(() => {
    const fetchContractType = async () => {
      if (!userId) {
        setIsLoadingContract(false);
        return;
      }
      
      try {
        console.log('Fetching contract type for user:', userId);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("contract_type")
          .eq("id", userId)
          .single();
          
        if (error) {
          console.error("Error fetching contract type:", error);
          // Keep default CONTRACT_TYPE_PJ if error
        } else if (profile?.contract_type) {
          console.log('Contract type fetched:', profile.contract_type);
          setContractType(profile.contract_type);
        } else {
          console.log('No contract type found, using default PJ');
        }
      } catch (error) {
        console.error("Error fetching contract type:", error);
        // Keep default CONTRACT_TYPE_PJ if error
      } finally {
        setIsLoadingContract(false);
      }
    };
    
    fetchContractType();
  }, [userId]);

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

  // Show loading state while fetching contract type
  if (isLoadingContract) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Comissão Projetada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Carregando informações de comissão...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate commission based on user's actual contract type - moved outside useMemo to avoid dependency issues
  console.log('Calculating commission with:', { totalSales, contractType });
  const commission = calculateCommission(totalSales, contractType);
  const isCommissionGoalMet = totalSales >= COMMISSION_GOAL_AMOUNT;

  console.log('Commission result:', commission);

  // Generate daily data for the chart - Fixed dependencies to avoid re-creation on each render
  const dailyData = useMemo(() => {
    if (!userId || !salesData || salesData.length === 0) {
      return [];
    }
    return generateDailyData(salesData, userId);
  }, [salesData, userId]);

  // Calculate the totals - Fixed dependencies and return type
  const totals = useMemo(() => {
    if (!dailyData || dailyData.length === 0) {
      return {
        totalDailySales: 0,
        totalCount: 0,
        averageSalesAmount: 0,
        averageContractsPerDay: 0,
        daysWithSales: 0,
        totalBusinessDays: 0
      };
    }
    return calculateTotals(dailyData);
  }, [dailyData]);
  
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


