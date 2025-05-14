
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { RecentSalesSection } from "@/components/dashboard/RecentSalesSection";
import { SalespeopleCommissionsCard } from "@/components/dashboard/SalespeopleCommissionsCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

export default function DashboardPage() {
  const { salesData, summary, trends, loading } = useDashboardData();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader isLoading={loading} />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6 animate-fade-in">
            <SalesSummarySection summary={summary} trends={trends} />
            <GoalsCommissionsSection summary={summary} salesData={salesData} />
            
            {/* Admin-only commission projections card */}
            {isAdmin && <SalespeopleCommissionsCard />}
            
            <RecentSalesSection salesData={salesData} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
