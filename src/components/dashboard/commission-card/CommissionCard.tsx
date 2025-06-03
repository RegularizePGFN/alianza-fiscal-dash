
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
  const [isLoadingContract, setIsLoadingContract] = useState(false);

  console.log("🎯 [COMMISSION_CARD] Component render:", {
    userId: user?.id,
    userRole: user?.role,
    totalSales,
    salesDataLength: salesData?.length
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // Early return for admin - no need to process data
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

  // Only generate data for non-admin users
  const dailyData = useMemo(() => {
    console.log("🔄 [COMMISSION_CARD] Generating daily data");
    if (!salesData || !user?.id || salesData.length === 0) {
      console.log("⚠️ [COMMISSION_CARD] No sales data or user ID");
      return [];
    }
    const result = generateDailyData(salesData, user.id);
    console.log("✅ [COMMISSION_CARD] Daily data generated:", result.length, "days");
    return result;
  }, [salesData, user?.id]);

  // Calculate totals only when we have data
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

  // Optimized contract type fetching - only when needed
  useEffect(() => {
    const fetchContractType = async () => {
      if (!user?.id) {
        console.log("⚠️ [COMMISSION_CARD] No user ID available");
        return;
      }
      
      console.log("🔄 [COMMISSION_CARD] Fetching contract type");
      setIsLoadingContract(true);
      
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("contract_type")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("❌ [COMMISSION_CARD] Error fetching contract type:", error);
        } else if (profile?.contract_type) {
          console.log('✅ [COMMISSION_CARD] Contract type fetched:', profile.contract_type);
          setContractType(profile.contract_type);
        }
      } catch (error) {
        console.error("💥 [COMMISSION_CARD] Error fetching contract type:", error);
      } finally {
        setIsLoadingContract(false);
        console.log("🏁 [COMMISSION_CARD] Contract type fetch completed");
      }
    };
    
    fetchContractType();
  }, [user?.id]);

  // Show loading state only while fetching contract type
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

  // Calculate commission based on user's contract type
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
        
        <MonthlySummary totals={totals} />
        
        <SalesChart dailyData={dailyData} />
      </CardContent>
    </Card>
  );
}
