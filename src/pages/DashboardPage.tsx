
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
  
  // Always call hooks at the top level
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

  console.log("📈 [DASHBOARD] Dashboard data state:", {
    loading,
    salesDataExists: !!salesData,
    summaryExists: !!summary,
    trendsExists: !!trends
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
          {/* DailyResultsCard - only visible to admin users */}
          {isAdmin && (
            <>
              <DailyResultsCard salesData={salesData} />
              <DailyResultsToday />
            </>
          )}
          
          {/* Daily Results Cards - positioned between the main cards */}
          {!isAdmin && <DailyResultsToday />}
          
          <GoalsCommissionsSection summary={summary} salesData={salesData} />
          
          {/* Admin-only commission projections card */}
          {isAdmin && <SalespeopleCommissionsCard />}
          
          {/* Weekly Reports - Single full width card */}
          <SalespersonWeeklyCard salesData={salesData} />
        </div>
      </div>
    </AppLayout>
  );
}
