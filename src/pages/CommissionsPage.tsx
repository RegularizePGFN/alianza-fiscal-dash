
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { MonthSelector } from "@/components/financeiro/MonthSelector";
import { useCommissionsData } from "@/hooks/useCommissionsData";
import { useSalespersonCommissionData } from "@/hooks/useSalespersonCommissionData";
import { CommissionsHeader } from "@/components/commissions/CommissionsHeader";
import { AdminCommissionsView } from "@/components/commissions/AdminCommissionsView";
import { SalespersonCommissionsView } from "@/components/commissions/SalespersonCommissionsView";

export default function CommissionsPage() {
  const { user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Convert to string format for hooks that expect it
  const selectedMonthString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;

  // Get commission data based on user role
  const adminData = useCommissionsData({ selectedMonth: selectedMonthString });
  const salespersonHookData = useSalespersonCommissionData({ selectedMonth: selectedMonthString });
  
  const isAdmin = user?.role === UserRole.ADMIN;

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto print:m-4">
        <div className="space-y-6 p-0">
          {/* Header */}
          <CommissionsHeader isAdmin={isAdmin} />

          {/* Month Selector */}
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />

          {/* Content based on user role */}
          {isAdmin ? (
            <AdminCommissionsView
              selectedMonthString={selectedMonthString}
              salespeople={adminData.salespeople}
              summaryTotals={adminData.summaryTotals}
              supervisorBonus={adminData.supervisorBonus}
              loading={adminData.loading}
            />
          ) : (
            <SalespersonCommissionsView
              salespersonData={salespersonHookData.salespersonData}
              loading={salespersonHookData.loading}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
