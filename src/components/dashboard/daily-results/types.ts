
export interface DailySalesperson {
  id: string;
  name: string;
  salesCount?: number;
  salesAmount?: number;
  goalsPercentage?: number;
  proposalsCount?: number;
  feesAmount?: number;
}

export interface DailyPerformance {
  totalSales: number;
  totalAmount: number;
  averageTicket: number;
  proposalsCount?: number;
  feesAmount?: number;
}

export interface SortConfig {
  key: keyof DailySalesperson;
  direction: 'asc' | 'desc';
}

// Adding new types needed for the DailyResultsContext
export type SortColumn = keyof DailySalesperson;
export type SortDirection = 'asc' | 'desc';
