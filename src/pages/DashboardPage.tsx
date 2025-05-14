
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { RecentSalesSection } from "@/components/dashboard/RecentSalesSection";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { DailyResultsCard } from "@/components/dashboard/daily-results";
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
            {/* Cards in a single row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* DailyResultsCard - only visible to admin users */}
              {isAdmin && (
                <div className="md:col-span-1">
                  <DailyResultsCard salesData={salesData} />
                </div>
              )}
              
              <div className="md:col-span-1">
                <SalesSummarySection summary={summary} trends={trends} />
              </div>
              
              <div className="md:col-span-1">
                <GoalsCommissionsSection summary={summary} salesData={salesData} />
              </div>
            </div>
            
            {/* Admin-only commission projections card */}
            {isAdmin && <SalespeopleCommissionsCard />}
            
            <RecentSalesSection salesData={salesData} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
