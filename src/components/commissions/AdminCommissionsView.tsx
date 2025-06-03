
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { SupervisorBonusCard } from "@/components/dashboard/SupervisorBonusCard";
import { CommissionsSummaryCards } from "./CommissionsSummaryCards";
import { TopPerformerCard } from "./TopPerformerCard";
import { CommissionsInfoCard } from "./CommissionsInfoCard";

interface AdminCommissionsViewProps {
  selectedMonthString: string;
  salespeople: any[];
  summaryTotals: any;
  supervisorBonus: any;
  loading: boolean;
}

export function AdminCommissionsView({ 
  selectedMonthString, 
  salespeople, 
  summaryTotals, 
  supervisorBonus, 
  loading 
}: AdminCommissionsViewProps) {
  // Calculate metrics for admin view
  const totalSalespeopleWithSales = salespeople.filter(p => p.totalSales > 0).length;
  const averageCommission = salespeople.length > 0 
    ? summaryTotals.projectedCommission / salespeople.length 
    : 0;
  const topPerformer = salespeople.reduce((top, current) => 
    current.projectedCommission > top.projectedCommission ? current : top, 
    { projectedCommission: 0, name: 'N/A' }
  );
  const salespeopleAboveGoal = salespeople.filter(p => p.goalPercentage >= 100).length;

  return (
    <>
      {/* Summary Cards */}
      <CommissionsSummaryCards
        totalSalespeopleWithSales={totalSalespeopleWithSales}
        averageCommission={averageCommission}
        salespeopleAboveGoal={salespeopleAboveGoal}
        totalSalespeople={salespeople.length}
        projectedCommission={summaryTotals.projectedCommission}
      />

      {/* Top Performer Card */}
      <TopPerformerCard topPerformer={topPerformer} />
      
      {/* Commission Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 print:break-inside-avoid print:mb-10 transition-colors duration-300">
        <SalespeopleCommissionsCard key={selectedMonthString} selectedMonth={selectedMonthString} />
      </div>

      {/* Supervisor Bonus Card */}
      {supervisorBonus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
          <SupervisorBonusCard 
            supervisorBonus={supervisorBonus} 
            loading={loading}
          />
        </div>
      )}

      {/* Additional Info Card */}
      <CommissionsInfoCard isAdmin={true} />
    </>
  );
}
