
import { Sale } from "@/lib/types";

export interface SalespersonWeeklyCardProps {
  salesData: Sale[];
  isLoading?: boolean;
}

export interface SalespersonData {
  id: string;
  name: string;
  initials: string;
  weeklyStats: {
    [week: number]: {
      count: number;
      amount: number;
    };
  };
  totalCount: number;
  totalAmount: number;
}

export interface WeeklyDataResult {
  weeklyData: Array<SalespersonData & { position: number }>;
  availableWeeks: number[];
  currentWeek: number;
  weeklyTotals: {
    [week: number]: {
      count: number;
      amount: number;
    };
  };
  weeklyGoals: {
    [id: string]: {
      [week: number]: number;
    };
  };
}

export interface WeeklyTableProps {
  weeklyData: Array<SalespersonData & { position: number }>;
  availableWeeks: number[];
  currentWeek: number;
  weeklyTotals: {
    [week: number]: {
      count: number;
      amount: number;
    }
  };
  weeklyGoals: {
    [id: string]: {
      [week: number]: number;
    };
  };
}
