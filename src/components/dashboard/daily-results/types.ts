
export interface DailySalesperson {
  id: string;
  name: string;
  salesCount: number;
  salesAmount: number;
  proposalsCount?: number; // Number of proposals created today
  feesAmount?: number;     // Total fees from proposals
}

export interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

export type SortColumn = 'name' | 'salesCount' | 'salesAmount' | 'proposals' | 'fees';
export type SortDirection = 'asc' | 'desc';
