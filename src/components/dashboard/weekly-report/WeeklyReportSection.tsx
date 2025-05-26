
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { useWeeklyData } from "./useWeeklyData";
import { WeeklyChart } from "./WeeklyChart";
import { WeeklyReportLoadingState } from "./WeeklyReportLoadingState";

interface WeeklyReportSectionProps {
  salesData: Sale[];
  isLoading?: boolean;
}

export function WeeklyReportSection({ salesData, isLoading = false }: WeeklyReportSectionProps) {
  const { weeklyData, currentWeek } = useWeeklyData(salesData);

  if (isLoading) {
    return <WeeklyReportLoadingState />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Consolidado por Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <WeeklyChart weeklyData={weeklyData} currentWeek={currentWeek} />
        </div>
      </CardContent>
    </Card>
  );
}
