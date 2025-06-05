
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsContainer } from "@/components/reports/ReportsContainer";
import { ReportsChartsSection } from "@/components/reports/ReportsChartsSection";
import { ReportsCommissionsSection } from "@/components/reports/ReportsCommissionsSection";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

export default function ReportsPage() {
  const { user } = useAuth();
  const [currentFilters, setCurrentFilters] = useState<{
    salespersonId: string | null;
    paymentMethod: PaymentMethod | null;
    dateFilter: DateFilter | null;
  }>({
    salespersonId: null,
    paymentMethod: null,
    dateFilter: null
  });

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // Get reports data for charts section using current filters
  const { salesData, loading, error } = useReportsData(currentFilters);

  const handleFiltersChange = (filters: {
    salespersonId: string | null;
    paymentMethod: PaymentMethod | null;
    dateFilter: DateFilter | null;
  }) => {
    setCurrentFilters(filters);
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col space-y-6 p-6">
        {/* Main Reports Container with filters and visualizations */}
        <ReportsContainer onFiltersChange={handleFiltersChange} />
        
        {/* Charts Section */}
        <ReportsChartsSection 
          salesData={salesData}
          loading={loading}
          error={error}
        />

        {/* Salespeople Commissions Section */}
        <ReportsCommissionsSection />
      </div>
    </AppLayout>
  );
}
