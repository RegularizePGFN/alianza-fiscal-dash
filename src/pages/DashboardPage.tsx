
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
            {/* DailyResultsCard - only visible to admin users */}
            {isAdmin && <DailyResultsCard salesData={salesData} />}
            
            <GoalsCommissionsSection summary={summary} salesData={salesData} />
            
            {/* Daily Results Cards - visible to all users - now positioned below main cards */}
            <DailyResultsToday />
            
            {/* Admin-only commission projections card */}
            {isAdmin && <SalespeopleCommissionsCard />}
            
            {/* Weekly Reports - Single full width card */}
            <SalespersonWeeklyCard salesData={salesData} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
