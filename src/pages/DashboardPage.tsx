
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
import { RecentSalesSection } from "@/components/dashboard/RecentSalesSection";
import { WeeklyReportSection } from "@/components/dashboard/WeeklyReportSection";
import { DailyResultsToday } from "@/components/dashboard/daily-results-today";

const DashboardPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader />
        <DailyResultsToday />
        <SalesSummarySection />
        <GoalsCommissionsSection />
        <RecentSalesSection />
        <WeeklyReportSection />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
