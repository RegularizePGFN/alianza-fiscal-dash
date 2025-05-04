
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { RecentSalesSection } from "@/components/dashboard/RecentSalesSection";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function DashboardPage() {
  const { salesData, summary, trends, loading } = useDashboardData();

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader isLoading={loading} />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <SalesSummarySection summary={summary} trends={trends} />
            <GoalsCommissionsSection summary={summary} />
            <RecentSalesSection salesData={salesData} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
