
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const isMobile = useIsMobile();

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
        <div className="space-y-4 md:space-y-6 p-0">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden print:hidden">
            <div className="p-3 sm:p-4 md:p-6">
              <ReportsHeader />
            </div>
            
            <div className="border-t border-gray-100 p-3 sm:p-4 md:p-6">
              <ReportsFilter 
                onSalespersonChange={setSelectedSalesperson}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onDateFilterChange={setDateFilter}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 md:p-6 print:break-inside-avoid print:mb-10">
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
