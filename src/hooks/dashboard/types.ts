
import { SalesSummary, Sale } from "@/lib/types";

export interface DashboardTrends {
  totalSalesTrend: { value: number; isPositive: boolean };
  averageSaleTrend: { value: number; isPositive: boolean };
}

export interface UseDashboardDataReturn {
  salesData: Sale[];
  summary: SalesSummary;
  trends: DashboardTrends;
  loading: boolean;
  fetchDashboardData: () => Promise<void>;
}
