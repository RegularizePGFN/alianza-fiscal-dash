
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { DailyResultsCard } from "@/components/dashboard/daily-results";
import { SalespersonWeeklyCard } from "@/components/dashboard/weekly-sales";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Month/Year selection state
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const { salesData, summary, trends, loading } = useDashboardData();

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const years = [2023, 2024, 2025, 2026];

  // Check if selected month is current month
  const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader isLoading={loading} />

        {/* Month/Year Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-300">
          <h3 className="text-lg font-medium mb-4">Período do Dashboard</h3>
          <div className="flex gap-4">
            <div className="min-w-[120px]">
              <label className="block text-sm font-medium mb-2">Mês</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="min-w-[100px]">
              <label className="block text-sm font-medium mb-2">Ano</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* DailyResultsCard - only visible to admin users and only for current month */}
            {isAdmin && isCurrentMonth && <DailyResultsCard salesData={salesData} />}
            
            <GoalsCommissionsSection 
              summary={summary} 
              salesData={salesData}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
            
            {/* Admin-only commission projections card */}
            {isAdmin && (
              <SalespeopleCommissionsCard 
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            )}
            
            {/* Weekly Reports - Single full width card */}
            <SalespersonWeeklyCard 
              salesData={salesData}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
