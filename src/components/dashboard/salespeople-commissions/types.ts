
export type SalespersonCommission = {
  id: string;
  name: string;
  totalSales: number;
  goalAmount: number;
  projectedCommission: number;
  goalPercentage: number;
  salesCount: number;
  metaGap: number;
  expectedProgress: number;
  remainingDailyTarget: number;
};

export type SortColumn = 
  | 'name' 
  | 'salesCount' 
  | 'totalSales' 
  | 'goalPercentage' 
  | 'metaGap'
  | 'remainingDailyTarget'
  | 'projectedCommission';

export type SortDirection = 'asc' | 'desc';

export type SummaryTotals = {
  salesCount: number;
  totalSales: number;
  goalAmount: number;
  goalPercentage: number;
  metaGap: number;
  remainingDailyTarget: number;
  projectedCommission: number;
};
