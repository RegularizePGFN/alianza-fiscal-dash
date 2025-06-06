
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { LoadingSpinner } from "../../ui/loading-spinner";
import { TableHeader } from "./TableHeader";
import { SalespersonRow } from "./SalespersonRow";
import { SummaryRow } from "./SummaryRow";
import { useSalespeopleCommissions } from "./useSalespeopleCommissions";
import { useCommissionsData } from "@/hooks/useCommissionsData";

interface SalespeopleCommissionsCardProps {
  selectedMonth?: string; // Format: "YYYY-MM"
}

export function SalespeopleCommissionsCard({ selectedMonth }: SalespeopleCommissionsCardProps) {
  const { user } = useAuth();
  
  // Use different hooks based on whether we have a selected month
  const currentMonthData = useSalespeopleCommissions();
  const selectedMonthData = useCommissionsData({ 
    selectedMonth: selectedMonth || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}` 
  });
  
  // Choose data source based on whether we have a selected month
  const { 
    salespeople, 
    summaryTotals, 
    loading, 
    sortColumn, 
    sortDirection, 
    handleSort 
  } = selectedMonth ? {
    ...selectedMonthData,
    sortColumn: 'name' as const,
    sortDirection: 'asc' as const,
    handleSort: () => {}
  } : currentMonthData;
  
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Consolidado Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Consolidado Vendedores
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
              {salespeople.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-500">
                    Nenhum vendedor encontrado
                  </td>
                </tr>
              ) : (
                salespeople.map((person) => (
                  <SalespersonRow key={person.id} person={person} />
                ))
              )}
              
              {/* Summary row */}
              {salespeople.length > 0 && (
                <SummaryRow summaryTotals={summaryTotals} />
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
