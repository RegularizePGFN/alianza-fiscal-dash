
import { useTodayData } from "@/contexts/TodayDataContext";

export interface TodayResults {
  totalSales: number;
  totalCommissions: number;
  proposalsCount: number;
  totalFees: number;
}

export function useTodayResults() {
  const { data, isLoading } = useTodayData();

  const results: TodayResults = {
    totalSales: data?.totalSalesAmount || 0,
    totalCommissions: data?.totalCommissions || 0,
    proposalsCount: data?.totalProposalsCount || 0,
    totalFees: data?.totalFees || 0,
  };

  return { results, loading: isLoading };
}
