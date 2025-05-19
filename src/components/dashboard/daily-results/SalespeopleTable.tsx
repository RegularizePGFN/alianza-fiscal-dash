
import { TableHeader } from "./TableHeader";
import { SalespersonRow } from "./SalespersonRow";
import { DailySalesperson } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SalespeopleTableProps {
  salespeople: DailySalesperson[];
}

export function SalespeopleTable({ salespeople }: SalespeopleTableProps) {
  return (
    <ScrollArea className="h-[150px]">
      <table className="w-full text-xs">
        <TableHeader />
        <tbody>
          {salespeople.map(salesperson => (
            <SalespersonRow 
              key={salesperson.id} 
              name={salesperson.name}
              proposalsSent={salesperson.proposalsCount || 0}
              fees={formatCurrency(salesperson.feesAmount || 0)}
              salesCount={salesperson.salesCount}
              salesAmount={formatCurrency(salesperson.salesAmount)}
            />
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}

// Helper function for formatting currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
