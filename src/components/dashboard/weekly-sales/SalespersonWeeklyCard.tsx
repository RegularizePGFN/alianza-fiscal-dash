
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/auth";
import { Sale, UserRole } from "@/lib/types";
import { WeeklyTable } from "./WeeklyTable";
import { processWeeklyData } from "./dataProcessing";

interface SalespersonWeeklyCardProps {
  salesData: Sale[];
  selectedMonth: number;
  selectedYear: number;
}

export function SalespersonWeeklyCard({ salesData, selectedMonth, selectedYear }: SalespersonWeeklyCardProps) {
  const { user } = useAuth();
  const [loading] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  // Filter sales data for the selected month/year
  const filteredSalesData = useMemo(() => {
    return salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === selectedMonth && saleDate.getFullYear() === selectedYear;
    });
  }, [salesData, selectedMonth, selectedYear]);

  const weeklyDataResult = useMemo(() => {
    if (!filteredSalesData.length) {
      return { 
        weeklyData: [], 
        availableWeeks: [], 
        currentWeek: 1,
        weeklyTotals: {},
        weeklyGoals: {},
        weekRanges: []
      };
    }
    return processWeeklyData(filteredSalesData);
  }, [filteredSalesData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório Semanal - {selectedMonth}/{selectedYear}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Semanal - {selectedMonth}/{selectedYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <WeeklyTable 
          weeklyData={weeklyDataResult.weeklyData}
          availableWeeks={weeklyDataResult.availableWeeks}
          currentWeek={weeklyDataResult.currentWeek}
          weeklyTotals={weeklyDataResult.weeklyTotals}
          weeklyGoals={weeklyDataResult.weeklyGoals}
          weekRanges={weeklyDataResult.weekRanges}
          sortState={{ week: null, field: null, direction: null }}
          onSort={(week, field) => {
            // TODO: Implement sorting functionality if needed
            console.log('Sort requested:', week, field);
          }}
        />
      </CardContent>
    </Card>
  );
}
