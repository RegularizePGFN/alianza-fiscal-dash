
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { RecentSalesSection } from "@/components/dashboard/RecentSalesSection";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function DashboardPage() {
  const { salesData, summary, trends, loading } = useDashboardData();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <DashboardHeader isLoading={loading} />
          <ThemeToggle />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6 animate-fade-in">
            <SalesSummarySection summary={summary} trends={trends} />
            <GoalsCommissionsSection summary={summary} salesData={salesData} />
            <RecentSalesSection salesData={salesData} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
