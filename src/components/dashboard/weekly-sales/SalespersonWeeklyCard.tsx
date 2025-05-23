
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { SalespersonWeeklyCardProps, WeeklyDataResult, SortState } from "./types";
import { WeeklyTable } from "./WeeklyTable";
import { processWeeklyData } from "./utils";

export function SalespersonWeeklyCard({ salesData, isLoading = false }: SalespersonWeeklyCardProps) {
  const [sortState, setSortState] = useState<SortState>({
    week: null,
    field: null,
    direction: null
  });

  // Process weekly data
  const baseData = useMemo<WeeklyDataResult>(() => {
    return processWeeklyData(salesData);
  }, [salesData]);

  // Apply sorting to the weekly data
  const { weeklyData, availableWeeks, currentWeek, weeklyTotals, weeklyGoals } = useMemo(() => {
    const result = { ...baseData };
    
    if (sortState.week !== null && sortState.field !== null && sortState.direction !== null) {
      result.weeklyData = [...baseData.weeklyData].sort((a, b) => {
        const weekA = a.weeklyStats[sortState.week!]?.[sortState.field!] || 0;
        const weekB = b.weeklyStats[sortState.week!]?.[sortState.field!] || 0;
        
        return sortState.direction === 'asc' 
          ? weekA - weekB 
          : weekB - weekA;
      });
    }
    
    return result;
  }, [baseData, sortState]);

  const handleSort = (week: number, field: "count" | "amount") => {
    setSortState(prevState => {
      // Se já está ordenando por essa coluna, alterna a direção ou remove a ordenação
      if (prevState.week === week && prevState.field === field) {
        if (prevState.direction === 'asc') {
          return { ...prevState, direction: 'desc' };
        } else if (prevState.direction === 'desc') {
          return { week: null, field: null, direction: null };
        } else {
          return { week, field, direction: 'asc' };
        }
      } 
      // Se está ordenando por uma nova coluna
      else {
        return { week, field, direction: 'asc' };
      }
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Desempenho Semanal</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p>Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  // No data scenario
  if (!availableWeeks || availableWeeks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Desempenho Semanal</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">Não há dados de vendas para exibir neste mês.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Desempenho Semanal</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <WeeklyTable 
          weeklyData={weeklyData}
          availableWeeks={availableWeeks}
          currentWeek={currentWeek}
          weeklyTotals={weeklyTotals}
          weeklyGoals={weeklyGoals}
          sortState={sortState}
          onSort={handleSort}
        />
      </CardContent>
    </Card>
  );
}
