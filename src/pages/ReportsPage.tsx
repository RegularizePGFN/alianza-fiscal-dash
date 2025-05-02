
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);

  // Redirect if not admin or manager
  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.MANAGER) {
    return <Navigate to="/dashboard" />;
  }

  const { salesData, loading, error } = useReportsData({
    salespersonId: selectedSalesperson,
    paymentMethod: selectedPaymentMethod,
    dateFilter: dateFilter
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <ReportsHeader />
        
        <ReportsFilter 
          onSalespersonChange={setSelectedSalesperson}
          onPaymentMethodChange={setSelectedPaymentMethod}
          onDateFilterChange={setDateFilter}
        />
        
        <ReportsCharts 
          salesData={salesData} 
          loading={loading}
          error={error}
        />
      </div>
    </AppLayout>
  );
}
