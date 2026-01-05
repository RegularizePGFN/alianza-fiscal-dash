
import { useMemo } from "react";
import { DailySalesperson } from "./types";
import { SalespeopleTable } from "./SalespeopleTable";
import { useDailyResults } from "./DailyResultsContext";
import { useTodayData } from "@/contexts/TodayDataContext";
import { SkeletonCard } from "../ui/SkeletonCard";

export function DailyResultsContent() {
  const { sortColumn, sortDirection } = useDailyResults();
  const { data, isLoading } = useTodayData();
  
  // Transform and sort salespeople data
  const salespeople = useMemo(() => {
    if (!data?.salespeople) return [];
    
    const mapped: DailySalesperson[] = data.salespeople.map(sp => ({
      id: sp.id,
      name: sp.name,
      salesCount: sp.salesCount,
      salesAmount: sp.salesAmount,
      proposalsCount: sp.proposalsCount,
      feesAmount: sp.feesAmount
    }));
    
    // Sort data
    return [...mapped].sort((a, b) => {
      if (sortColumn === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortColumn === 'proposals') {
        const valueA = a.proposalsCount ?? 0;
        const valueB = b.proposalsCount ?? 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else if (sortColumn === 'fees') {
        const valueA = a.feesAmount ?? 0;
        const valueB = b.feesAmount ?? 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        const valueA = (a[sortColumn] as number) ?? 0;
        const valueB = (b[sortColumn] as number) ?? 0;
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
    });
  }, [data?.salespeople, sortColumn, sortDirection]);
  
  if (isLoading) {
    return (
      <div className="flex h-[180px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (salespeople.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
        Sem vendedores cadastrados
      </div>
    );
  }
  
  return <SalespeopleTable salespeople={salespeople} />;
}
