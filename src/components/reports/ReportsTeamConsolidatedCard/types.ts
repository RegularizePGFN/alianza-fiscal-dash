
import { Sale } from "@/lib/types";

export interface ReportsTeamConsolidatedCardProps {
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
}

export interface SalespersonStats {
  id: string;
  name: string;
  pixTotal: number;
  pixCount: number;
  boletoTotal: number;
  boletoCount: number;
  creditTotal: number;
  creditCount: number;
  total: number;
  totalCount: number;
}

export interface LocalDateFilter {
  startDate: string;
  endDate: string;
}

export type SortColumn = 'name' | 'pixTotal' | 'boletoTotal' | 'creditTotal' | 'total' | 'pixCount' | 'boletoCount' | 'creditCount' | 'totalCount';
export type SortDirection = 'asc' | 'desc';
