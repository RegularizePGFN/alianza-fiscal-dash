
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
