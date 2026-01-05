
import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { calculateCommission } from "@/lib/utils";
import { calculateSupervisorBonus, isSupervisor } from "@/lib/supervisorUtils";

export interface SalespersonData {
  id: string;
  name: string;
  contractType: string;
  email: string;
  salesCount: number;
  salesAmount: number;
  proposalsCount: number;
  feesAmount: number;
}

export interface TodayDashboardData {
  totalSalesCount: number;
  totalSalesAmount: number;
  totalProposalsCount: number;
  totalFees: number;
  totalCommissions: number;
  salespeople: SalespersonData[];
}

interface TodayDataContextType {
  data: TodayDashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const TodayDataContext = createContext<TodayDataContextType | undefined>(undefined);

export function TodayDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['today-dashboard', user?.id],
    queryFn: async (): Promise<TodayDashboardData> => {
      if (!user) {
        return {
          totalSalesCount: 0,
          totalSalesAmount: 0,
          totalProposalsCount: 0,
          totalFees: 0,
          totalCommissions: 0,
          salespeople: []
        };
      }

      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_today_dashboard_summary', { p_user_id: user.id });

      if (rpcError) {
        console.error("Error fetching today dashboard:", rpcError);
        throw rpcError;
      }

      const result = rpcData?.[0] || {
        total_sales_count: 0,
        total_sales_amount: 0,
        total_proposals_count: 0,
        total_fees: 0,
        salespeople: []
      };

      // Parse salespeople from JSONB
      const rawSalespeople = result.salespeople as unknown as Array<Record<string, unknown>> || [];
      const salespeople: SalespersonData[] = rawSalespeople.map((sp) => ({
        id: String(sp.id || ""),
        name: String(sp.name || "Sem nome"),
        contractType: String(sp.contractType || "PJ"),
        email: String(sp.email || ""),
        salesCount: Number(sp.salesCount) || 0,
        salesAmount: Number(sp.salesAmount) || 0,
        proposalsCount: Number(sp.proposalsCount) || 0,
        feesAmount: Number(sp.feesAmount) || 0
      }));

      // Calculate commissions
      let totalCommissions = 0;

      if (isAdmin) {
        let teamTotalSales = 0;

        salespeople.forEach((sp) => {
          if (!isSupervisor(sp.email)) {
            teamTotalSales += sp.salesAmount;
          }
          const commission = calculateCommission(sp.salesAmount, sp.contractType);
          totalCommissions += commission.amount;
        });

        const supervisorBonus = calculateSupervisorBonus(teamTotalSales);
        totalCommissions += supervisorBonus.amount;
      } else {
        // For non-admin, calculate only their commission
        const currentUser = salespeople.find(sp => sp.id === user.id);
        if (currentUser) {
          const commission = calculateCommission(currentUser.salesAmount, currentUser.contractType);
          totalCommissions = commission.amount;
        }
      }

      return {
        totalSalesCount: Number(result.total_sales_count) || 0,
        totalSalesAmount: Number(result.total_sales_amount) || 0,
        totalProposalsCount: Number(result.total_proposals_count) || 0,
        totalFees: Number(result.total_fees) || 0,
        totalCommissions,
        salespeople
      };
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000 // Auto-refresh every 1 minute
  });

  return (
    <TodayDataContext.Provider value={{
      data: data || null,
      isLoading,
      error: error as Error | null,
      refetch
    }}>
      {children}
    </TodayDataContext.Provider>
  );
}

export function useTodayData() {
  const context = useContext(TodayDataContext);
  if (context === undefined) {
    throw new Error('useTodayData must be used within a TodayDataProvider');
  }
  return context;
}
