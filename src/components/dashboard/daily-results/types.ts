
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
