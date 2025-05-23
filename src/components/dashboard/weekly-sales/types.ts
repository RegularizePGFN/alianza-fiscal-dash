
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

export interface WeekRange {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
}

export type SortDirection = "asc" | "desc" | null;

export interface SortState {
  week: number | null;
  field: "count" | "amount" | null;
  direction: SortDirection;
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
  weekRanges: WeekRange[];
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
  weekRanges: WeekRange[];
  sortState: SortState;
  onSort: (week: number, field: "count" | "amount") => void;
}
