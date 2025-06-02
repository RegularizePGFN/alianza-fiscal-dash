
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/auth";
import { Sale, UserRole } from "@/lib/types";
import { WeeklyTable } from "./WeeklyTable";
import { processWeeklyData } from "./dataProcessing";
import { getCurrentMonthWeeks } from "./weekCalculations";

interface SalespersonWeeklyCardProps {
  salesData: Sale[];
  selectedMonth: number;
  selectedYear: number;
}

export function SalespersonWeeklyCard({ salesData, selectedMonth, selectedYear }: SalespersonWeeklyCardProps) {
  const { user } = useAuth();
  const [loading] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  // Get weeks for the selected month/year
  const weeks = useMemo(() => {
    return getCurrentMonthWeeks(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Filter sales data for the selected month/year
  const filteredSalesData = useMemo(() => {
    return salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === selectedMonth && saleDate.getFullYear() === selectedYear;
    });
  }, [salesData, selectedMonth, selectedYear]);

  const weeklyData = useMemo(() => {
    if (!filteredSalesData.length) return [];
    return processWeeklyData(filteredSalesData, weeks, isAdmin, user);
  }, [filteredSalesData, weeks, isAdmin, user]);

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
        <WeeklyTable data={weeklyData} weeks={weeks} />
      </CardContent>
    </Card>
  );
}
