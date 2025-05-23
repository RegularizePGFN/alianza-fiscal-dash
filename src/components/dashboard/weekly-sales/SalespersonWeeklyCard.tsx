
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { SalespersonWeeklyCardProps, WeeklyDataResult } from "./types";
import { WeeklyTable } from "./WeeklyTable";
import { processWeeklyData } from "./utils";

export function SalespersonWeeklyCard({ salesData, isLoading = false }: SalespersonWeeklyCardProps) {
  // Process weekly data
  const { weeklyData, availableWeeks, currentWeek, weeklyTotals, weeklyGoals } = useMemo<WeeklyDataResult>(() => {
    return processWeeklyData(salesData);
  }, [salesData]);

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
        />
      </CardContent>
    </Card>
  );
}
