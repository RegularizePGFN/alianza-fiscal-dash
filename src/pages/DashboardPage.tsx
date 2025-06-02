
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SalesSummarySection } from "@/components/dashboard/SalesSummarySection";
import { GoalsCommissionsSection } from "@/components/dashboard/GoalsCommissionsSection";
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
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
