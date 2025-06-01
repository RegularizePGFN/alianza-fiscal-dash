
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { LoadingSpinner } from "../../ui/loading-spinner";
import { TableHeader } from "./TableHeader";
import { SalespersonRow } from "./SalespersonRow";
import { SummaryRow } from "./SummaryRow";
import { useSalespeopleCommissions } from "./useSalespeopleCommissions";

interface SalespeopleCommissionsCardProps {
  selectedMonth?: number;
  selectedYear?: number;
}

export function SalespeopleCommissionsCard({ selectedMonth, selectedYear }: SalespeopleCommissionsCardProps) {
  const { user } = useAuth();
  const { 
    salespeople, 
    summaryTotals, 
    loading, 
    sortColumn, 
    sortDirection, 
    handleSort 
  } = useSalespeopleCommissions(selectedMonth, selectedYear);
  
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            {selectedMonth && selectedYear 
              ? `Consolidado Vendedores - ${selectedMonth}/${selectedYear}`
              : "Projeção de Comissões (Vendedores)"
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Convert SalespersonCommissionData to SalespersonCommission for display
  const convertedSalespeople = salespeople.map(person => ({
    id: person.id,
    name: person.name,
    totalSales: person.netValue,
    goalAmount: person.goal,
    commissionGoalAmount: 0,
    projectedCommission: person.commission,
    goalPercentage: person.goalProgress,
    salesCount: person.totalSales,
    metaGap: person.netValue - person.goal,
    expectedProgress: 0,
    remainingDailyTarget: Math.max(0, person.goal - person.netValue),
    zeroDaysCount: 0
  }));
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {selectedMonth && selectedYear 
            ? `Consolidado Vendedores - ${selectedMonth}/${selectedYear}`
            : "Consolidado Vendedores"
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <TableHeader 
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              handleSort={handleSort}
            />
            <tbody>
              {convertedSalespeople.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-gray-500">
                    Nenhum vendedor encontrado
                  </td>
                </tr>
              ) : (
                convertedSalespeople.map((person) => (
                  <SalespersonRow key={person.id} person={person} />
                ))
              )}
              
              {/* Summary row */}
              {convertedSalespeople.length > 0 && (
                <SummaryRow summaryTotals={summaryTotals} />
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
