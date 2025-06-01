
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { CommissionsHistoryCard } from "./CommissionsHistoryCard";
import { CommissionsSummaryCard } from "./CommissionsSummaryCard";

interface CommissionsDashboardProps {
  selectedMonth: number;
  selectedYear: number;
}

export function CommissionsDashboard({ selectedMonth, selectedYear }: CommissionsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Resumo das comissões do mês */}
      <CommissionsSummaryCard 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
      
      {/* Consolidado de vendedores com filtro por mês */}
      <SalespeopleCommissionsCard 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
      
      {/* Histórico detalhado de comissões */}
      <CommissionsHistoryCard 
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}
