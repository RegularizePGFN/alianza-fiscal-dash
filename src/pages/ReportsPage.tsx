
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsContainer } from "@/components/reports/ReportsContainer";
import { ReportsTeamConsolidatedCard } from "@/components/reports/ReportsTeamConsolidatedCard";
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

  // Get reports data for the new team consolidated card using current filters
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
        
        {/* Team Consolidated Section */}
        <ReportsTeamConsolidatedCard 
          salesData={salesData}
          loading={loading}
          error={error}
        />
      </div>
    </AppLayout>
  );
}
