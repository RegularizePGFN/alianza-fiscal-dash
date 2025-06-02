
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { RecentSalesSection } from "@/components/dashboard/RecentSalesSection";
import { WeeklyReportSection } from "@/components/dashboard/WeeklyReportSection";
import { DailyResultsToday } from "@/components/dashboard/daily-results-today";
import { useDashboardData } from "@/hooks/useDashboardData";

const DashboardPage = () => {
  const { salesData, summary, trends, loading } = useDashboardData();

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader isLoading={loading} />
        <DailyResultsToday />
        <SalesSummarySection summary={summary} trends={trends} />
        <GoalsCommissionsSection summary={summary} salesData={salesData} />
        <RecentSalesSection salesData={salesData} />
        <WeeklyReportSection salesData={salesData} isLoading={loading} />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
