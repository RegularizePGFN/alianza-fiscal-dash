
import { Sale } from "@/lib/types";

export type SortColumn = 'name' | 'salesCount' | 'salesAmount';
export type SortDirection = 'asc' | 'desc';

export interface DailySalesperson {
  id: string;
  name: string;
  salesCount: number;
  salesAmount: number;
}

export interface DailyResultsContextType {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  handleSort: (column: SortColumn) => void;
}

export interface DailyResultsProps {
  salesData: Sale[];
}
