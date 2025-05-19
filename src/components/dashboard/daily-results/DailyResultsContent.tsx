import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DailySummaryCard } from "./DailySummaryCard";
import { SalespersonRow } from "./SalespersonRow";
import { TableHeader } from "@/components/ui/table";

interface DailyResultsContentProps {
  salesData: any[];
  isLoading: boolean;
}

const DailyResultsContent = ({ salesData, isLoading }: DailyResultsContentProps) => {
  const salespeople = salesData.reduce((acc: any, sale: any) => {
    const existingPerson = acc.find((person: any) => person.id === sale.salesperson_id);
    
    if (existingPerson) {
      existingPerson.salesAmount = (parseFloat((existingPerson.salesAmount || "0").replace(/[^\d,\.]/g, '').replace(",", ".")) + parseFloat(sale.amount.replace(/[^\d,\.]/g, '').replace(",", "."))).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      existingPerson.salesCount = (existingPerson.salesCount || 0) + 1;
      existingPerson.proposalsSent = (existingPerson.proposalsSent || 0) + (sale.proposals_sent ? 1 : 0);
      existingPerson.fees_value = (parseFloat((existingPerson.fees_value || "0").replace(/[^\d,\.]/g, '').replace(",", ".")) + parseFloat(sale.fees_value?.replace(/[^\d,\.]/g, '').replace(",", ".") || "0")).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      acc.push({
        id: sale.salesperson_id,
        name: sale.salesperson_name,
        salesAmount: sale.amount,
        salesCount: 1,
        proposalsSent: sale.proposals_sent ? 1 : 0,
        fees_value: sale.fees_value
      });
    }
    return acc;
  }, []);

  const salespeopleSortedBySales = salespeople.sort((a: any, b: any) => {
    const amountA = parseFloat((a.salesAmount || "0").replace(/[^\d,\.]/g, '').replace(",", "."));
    const amountB = parseFloat((b.salesAmount || "0").replace(/[^\d,\.]/g, '').replace(",", "."));
    return amountB - amountA;
  });

  return (
    <div>
      <DailySummaryCard />

      <div className="mt-6 border rounded-lg overflow-hidden dark:border-gray-700">
        <div className="bg-muted py-3 dark:bg-gray-800">
          <div className="flex justify-center"> {/* Center-align the header */}
            <h3 className="font-medium text-lg text-center">Vendedores do Dia</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <tr>
                <th className="text-left pl-4 py-3 text-sm font-medium text-muted-foreground">
                  Nome
                </th>
                {/* Reordered columns as requested */}
                <th className="text-center py-3 text-sm font-medium text-muted-foreground">
                  Prop. Enviadas
                </th>
                <th className="text-center py-3 text-sm font-medium text-muted-foreground">
                  Honorários
                </th>
                <th className="text-center py-3 text-sm font-medium text-muted-foreground">
                  Vendas
                </th>
                <th className="text-right pr-4 py-3 text-sm font-medium text-muted-foreground">
                  Valor
                </th>
              </tr>
            </TableHeader>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    <LoadingSpinner size="sm" />
                  </td>
                </tr>
              ) : salespeopleSortedBySales?.length ? (
                salespeopleSortedBySales.map((person) => (
                  <SalespersonRow
                    key={person.id}
                    name={person.name}
                    // Reordered values to match the column order above
                    proposalsSent={person.proposalsSent || 0}
                    fees={formatCurrency(person.fees_value?.replace(/[^\d,\.]/g, '') || "0")}
                    salesCount={person.salesCount || 0}
                    salesAmount={formatCurrency(person.salesAmount || "0")}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-8 text-muted-foreground">
                    Nenhum vendedor registrou vendas hoje
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyResultsContent;
