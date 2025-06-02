
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { useTodayResults } from "./useTodayResults";
import { LoadingCards } from "./LoadingCards";
import { ProposalsCard } from "./ProposalsCard";
import { FeesCard } from "./FeesCard";
import { CommissionsCard } from "./CommissionsCard";

export function DailyResultsToday() {
  const { user } = useAuth();
  const { results, loading } = useTodayResults();

  if (loading) {
    return <LoadingCards />;
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ProposalsCard count={results.proposalsCount} isAdmin={isAdmin} />
      <FeesCard totalFees={results.totalFees} isAdmin={isAdmin} />
      <CommissionsCard totalCommissions={results.totalCommissions} isAdmin={isAdmin} />
    </div>
  );
}
