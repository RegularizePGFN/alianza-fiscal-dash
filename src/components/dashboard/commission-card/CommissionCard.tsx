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
  const [contractType, setContractType] = useState<string>(CONTRACT_TYPE_PJ);
  const [isLoadingContract, setIsLoadingContract] = useState(true);

  console.log("🎯 [COMMISSION_CARD] Component render:", {
    userId: user?.id,
    userRole: user?.role,
    totalSales,
    salesDataLength: salesData?.length
  });

  // Always call all hooks at the top level - never conditional
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Always generate daily data, even for admin users
  const dailyData = useMemo(() => {
    console.log("🔄 [COMMISSION_CARD] Generating daily data");
    if (!salesData || !user?.id) {
      console.log("⚠️ [COMMISSION_CARD] No sales data or user ID");
      return [];
    }
    const result = generateDailyData(salesData, user.id);
    console.log("✅ [COMMISSION_CARD] Daily data generated:", result.length, "days");
    return result;
  }, [salesData, user?.id]);

  // Always calculate totals, even for admin users - fix the type issue
  const totals = useMemo(() => {
    console.log("🔄 [COMMISSION_CARD] Calculating totals");
    if (!dailyData || dailyData.length === 0) {
      console.log("⚠️ [COMMISSION_CARD] No daily data available");
      return {
        totalDailySales: 0,
        totalCount: 0,
        averageSalesAmount: 0,
        averageContractsPerDay: 0,
        daysWithSales: 0,
        totalBusinessDays: 0
      };
    }
    const result = calculateTotals(dailyData);
    console.log("✅ [COMMISSION_CARD] Totals calculated:", result);
    return result;
  }, [dailyData]);

  // Always call useEffect hooks
  useEffect(() => {
    const fetchContractType = async () => {
      console.log("🔄 [COMMISSION_CARD] Fetching contract type");
      if (!user?.id || isAdmin) {
        console.log("⚠️ [COMMISSION_CARD] Skipping contract type fetch - admin or no user");
        setIsLoadingContract(false);
        return;
      }
      
      try {
        console.log('🔍 [COMMISSION_CARD] Fetching contract type for user:', user.id);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("contract_type")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("❌ [COMMISSION_CARD] Error fetching contract type:", error);
          // Keep default CONTRACT_TYPE_PJ if error
        } else if (profile?.contract_type) {
          console.log('✅ [COMMISSION_CARD] Contract type fetched:', profile.contract_type);
          setContractType(profile.contract_type);
        } else {
          console.log('⚠️ [COMMISSION_CARD] No contract type found, using default PJ');
        }
      } catch (error) {
        console.error("💥 [COMMISSION_CARD] Error fetching contract type:", error);
        // Keep default CONTRACT_TYPE_PJ if error
      } finally {
        setIsLoadingContract(false);
        console.log("🏁 [COMMISSION_CARD] Contract type fetch completed");
      }
    };
    
    fetchContractType();
  }, [user?.id, isAdmin]);

  // Early return for admin after all hooks are called
  if (isAdmin) {
    console.log("👑 [COMMISSION_CARD] Admin user - showing admin message");
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
    console.log("⏳ [COMMISSION_CARD] Loading contract type");
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

  // Calculate commission based on user's actual contract type
  console.log('💰 [COMMISSION_CARD] Calculating commission with:', { totalSales, contractType });
  const commission = calculateCommission(totalSales, contractType);
  const isCommissionGoalMet = totalSales >= COMMISSION_GOAL_AMOUNT;

  console.log('✅ [COMMISSION_CARD] Commission result:', commission);
  
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
