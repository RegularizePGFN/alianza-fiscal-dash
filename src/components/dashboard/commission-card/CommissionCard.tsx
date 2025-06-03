
import { useMemo, useState, useEffect, useCallback } from "react";
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
  const [isDataReady, setIsDataReady] = useState(false);

  // Extract stable user ID and ensure it's consistent
  const userId = useMemo(() => user?.id, [user?.id]);
  
  console.log('CommissionCard Debug - User Info:', {
    userId,
    userName: user?.name,
    userEmail: user?.email,
    salesDataLength: salesData?.length,
    totalSales,
    goalAmount
  });

  // CRITICAL: Add Lívia-specific debug and fix
  const isLivia = user?.email === 'livia.pereira@aliancafiscal.com';
  
  if (isLivia) {
    console.log('LÍVIA DEBUG - Raw salesData:', salesData);
    console.log('LÍVIA DEBUG - salesData type check:', {
      isArray: Array.isArray(salesData),
      length: salesData?.length,
      firstItem: salesData?.[0]
    });
  }
  
  // Stabilize salesData with special handling for Lívia
  const stableSalesData = useMemo(() => {
    if (isLivia) {
      console.log('LÍVIA DEBUG - Processing salesData in useMemo');
    }
    
    // Special handling for Lívia's data issues
    if (!salesData) {
      if (isLivia) console.log('LÍVIA DEBUG - salesData is null/undefined, returning empty array');
      return [];
    }
    
    if (!Array.isArray(salesData)) {
      if (isLivia) console.log('LÍVIA DEBUG - salesData is not array, returning empty array');
      return [];
    }
    
    // Check for corrupted data in Lívia's sales
    const validSalesData = salesData.filter(sale => {
      const isValid = sale && 
        typeof sale === 'object' && 
        sale.id && 
        sale.salesperson_id &&
        typeof sale.gross_amount === 'number' &&
        sale.sale_date;
      
      if (isLivia && !isValid) {
        console.log('LÍVIA DEBUG - Found invalid sale:', sale);
      }
      
      return isValid;
    });
    
    if (isLivia) {
      console.log('LÍVIA DEBUG - Valid sales after filtering:', validSalesData.length, 'of', salesData.length);
    }
    
    return validSalesData;
  }, [salesData, isLivia]);

  // Fetch user's contract type from profiles table
  useEffect(() => {
    const fetchContractType = async () => {
      if (!userId) {
        setIsLoadingContract(false);
        setIsDataReady(true);
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
        setIsDataReady(true);
      }
    };
    
    fetchContractType();
  }, [userId]);

  // Stabilized data generation function with Lívia-specific protection
  const generateStableData = useCallback(() => {
    if (isLivia) {
      console.log('LÍVIA DEBUG - generateStableData called with:', {
        userId,
        stableSalesDataLength: stableSalesData?.length,
        isDataReady
      });
    }
    
    if (!userId || !stableSalesData || stableSalesData.length === 0) {
      if (isLivia) console.log('LÍVIA DEBUG - Returning empty array from generateStableData');
      return [];
    }
    
    try {
      const result = generateDailyData(stableSalesData, userId);
      if (isLivia) {
        console.log('LÍVIA DEBUG - generateDailyData result:', result);
      }
      return result;
    } catch (error) {
      console.error('Error generating daily data:', error);
      if (isLivia) console.error('LÍVIA DEBUG - generateDailyData error:', error);
      return [];
    }
  }, [stableSalesData, userId, isLivia]);

  // Stabilized totals calculation function
  const calculateStableTotals = useCallback((dailyDataInput: any[]) => {
    if (isLivia) {
      console.log('LÍVIA DEBUG - calculateStableTotals called with:', dailyDataInput);
    }
    
    if (!Array.isArray(dailyDataInput) || dailyDataInput.length === 0) {
      return {
        totalDailySales: 0,
        totalCount: 0,
        averageSalesAmount: 0,
        averageContractsPerDay: 0,
        daysWithSales: 0,
        totalBusinessDays: 0
      };
    }
    try {
      const result = calculateTotals(dailyDataInput);
      if (isLivia) {
        console.log('LÍVIA DEBUG - calculateTotals result:', result);
      }
      return result;
    } catch (error) {
      console.error('Error calculating totals:', error);
      if (isLivia) console.error('LÍVIA DEBUG - calculateTotals error:', error);
      return {
        totalDailySales: 0,
        totalCount: 0,
        averageSalesAmount: 0,
        averageContractsPerDay: 0,
        daysWithSales: 0,
        totalBusinessDays: 0
      };
    }
  }, [isLivia]);

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

  // Show loading state while fetching contract type or data is not ready
  if (isLoadingContract || !isDataReady) {
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

  // FOR LÍVIA: Use simplified version to avoid useMemo issues
  if (isLivia) {
    console.log('LÍVIA DEBUG - Using simplified commission card');
    
    // Simple daily data without complex useMemo
    const simpleDailyData = (() => {
      try {
        if (!userId || !stableSalesData || stableSalesData.length === 0) {
          return [];
        }
        return generateDailyData(stableSalesData, userId);
      } catch (error) {
        console.error('LÍVIA DEBUG - Error in simple daily data generation:', error);
        return [];
      }
    })();
    
    // Simple totals without complex useMemo
    const simpleTotals = (() => {
      try {
        if (!Array.isArray(simpleDailyData) || simpleDailyData.length === 0) {
          return {
            totalDailySales: 0,
            totalCount: 0,
            averageSalesAmount: 0,
            averageContractsPerDay: 0,
            daysWithSales: 0,
            totalBusinessDays: 0
          };
        }
        return calculateTotals(simpleDailyData);
      } catch (error) {
        console.error('LÍVIA DEBUG - Error in simple totals calculation:', error);
        return {
          totalDailySales: 0,
          totalCount: 0,
          averageSalesAmount: 0,
          averageContractsPerDay: 0,
          daysWithSales: 0,
          totalBusinessDays: 0
        };
      }
    })();
    
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
          
          <MonthlySummary totals={simpleTotals} />
          
          <SalesChart dailyData={simpleDailyData} />
        </CardContent>
      </Card>
    );
  }

  // For other users, use the normal implementation with useMemo
  // Generate daily data for the chart - Using stabilized function and dependencies
  const dailyData = useMemo(() => {
    if (!isDataReady || !userId) {
      return [];
    }
    return generateStableData();
  }, [generateStableData, isDataReady, userId]);

  // Calculate the totals - Using stabilized function and dependencies
  const totals = useMemo(() => {
    if (!isDataReady) {
      return {
        totalDailySales: 0,
        totalCount: 0,
        averageSalesAmount: 0,
        averageContractsPerDay: 0,
        daysWithSales: 0,
        totalBusinessDays: 0
      };
    }
    return calculateStableTotals(dailyData);
  }, [calculateStableTotals, dailyData, isDataReady]);
  
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
