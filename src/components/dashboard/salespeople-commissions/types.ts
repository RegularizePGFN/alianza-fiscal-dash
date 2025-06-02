
export type SalespersonCommission = {
  id: string;
  name: string;
  totalSales: number;
  goalAmount: number;
  commissionGoalAmount: number; // New field for commission goal
  projectedCommission: number;
  goalPercentage: number;
  salesCount: number;
  metaGap: number;
  expectedProgress: number;
  remainingDailyTarget: number;
  zeroDaysCount: number; // New field for days with zero sales
};

export type SortColumn = 
  | 'name' 
  | 'salesCount' 
  | 'totalSales' 
  | 'goalPercentage' 
  | 'metaGap'
  | 'remainingDailyTarget'
  | 'projectedCommission'
  | 'zeroDaysCount'; // Add new sortable column

export type SortDirection = 'asc' | 'desc';

export type SummaryTotals = {
  salesCount: number;
  totalSales: number;
  goalAmount: number;
  commissionGoalAmount: number; // New field for commission goal
  goalPercentage: number;
  metaGap: number;
  remainingDailyTarget: number;
  projectedCommission: number;
  zeroDaysCount: number; // New field for days with zero sales
};
