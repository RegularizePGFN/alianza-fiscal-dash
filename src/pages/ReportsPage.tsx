
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);

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
      <div className="max-w-7xl mx-auto print:m-2">
        <div className="space-y-3 p-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden print:hidden transition-colors duration-300 p-3">
            <ReportsHeader />
          </div>
          
          <ReportsFilter 
            onSalespersonChange={setSelectedSalesperson}
            onPaymentMethodChange={setSelectedPaymentMethod}
            onDateFilterChange={setDateFilter}
          />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 print:break-inside-avoid print:mb-6 transition-colors duration-300">
            <ReportsCharts 
              salesData={salesData} 
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
