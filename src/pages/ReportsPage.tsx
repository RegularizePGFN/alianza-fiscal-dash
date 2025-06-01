
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsSubTabs } from "@/components/reports/ReportsSubTabs";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { ReportsHeader } from "@/components/reports/ReportsHeader";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const [consolidatedMonth, setConsolidatedMonth] = useState<number>(new Date().getMonth() + 1);
  const [consolidatedYear, setConsolidatedYear] = useState<number>(new Date().getFullYear());

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  const { salesData, loading, error } = useReportsData({
    salespersonId: selectedSalesperson,
    paymentMethod: selectedPaymentMethod,
    dateFilter: dateFilter
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto print:m-4">
        <div className="space-y-6 p-0">
          <ReportsHeader />
          
          <ReportsSubTabs
            selectedSalesperson={selectedSalesperson}
            selectedPaymentMethod={selectedPaymentMethod}
            dateFilter={dateFilter}
            consolidatedMonth={consolidatedMonth}
            consolidatedYear={consolidatedYear}
            salesData={salesData}
            loading={loading}
            error={error}
            onSalespersonChange={setSelectedSalesperson}
            onPaymentMethodChange={setSelectedPaymentMethod}
            onDateFilterChange={setDateFilter}
            onConsolidatedMonthChange={setConsolidatedMonth}
            onConsolidatedYearChange={setConsolidatedYear}
          />
        </div>
      </div>
    </AppLayout>
  );
}
