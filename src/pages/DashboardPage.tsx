
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
        {/* Header with period selector */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral de vendas e comissões para {months.find(m => m.value === selectedMonth)?.label} de {selectedYear}
            </p>
          </div>
          
          {/* Period selector in top right */}
          <div className="flex gap-2 items-center">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Ano" />
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
