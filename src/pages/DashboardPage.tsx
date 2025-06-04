
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { DailyResultsCard } from "@/components/dashboard/daily-results";
import { SalespersonWeeklyCard } from "@/components/dashboard/weekly-sales";
import { DailyResultsToday } from "@/components/dashboard/daily-results-today";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { salesData, summary, trends, loading } = useDashboardData();
  
  const isAdmin = user?.role === UserRole.ADMIN;

  console.log("📊 [DASHBOARD] Dashboard render:", {
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role,
    isAdmin,
    loading,
    salesDataLength: salesData?.length,
    summary
  });

  if (loading) {
    console.log("⏳ [DASHBOARD] Showing loading spinner");
    return (
      <AppLayout>
        <div className="space-y-6">
          <DashboardHeader isLoading={loading} />
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader isLoading={loading} />
        
        <div className="space-y-6 animate-fade-in">
          {isAdmin && (
            <>
              <DailyResultsCard salesData={salesData} />
              <DailyResultsToday />
            </>
          )}
          
          {!isAdmin && <DailyResultsToday />}
          
          <GoalsCommissionsSection summary={summary} salesData={salesData} />
          
          {isAdmin && <SalespeopleCommissionsCard />}
          
          <SalespersonWeeklyCard salesData={salesData} />
        </div>
      </div>
    </AppLayout>
  );
}
