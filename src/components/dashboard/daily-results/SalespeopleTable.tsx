
import { TableHeader } from "./TableHeader";
import SalespersonRow from "./SalespersonRow";
import { DailySalesperson } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";

interface SalespeopleTableProps {
  salespeople: DailySalesperson[];
}

export function SalespeopleTable({ salespeople }: SalespeopleTableProps) {
  // Find top performer (highest sales amount)
  const topPerformerId = useMemo(() => {
    if (salespeople.length === 0) return null;
    const sorted = [...salespeople].sort((a, b) => b.salesAmount - a.salesAmount);
    // Only highlight if they have at least 1 sale
    return sorted[0]?.salesAmount > 0 ? sorted[0].id : null;
  }, [salespeople]);

  return (
    <ScrollArea className="h-[180px]">
      <table className="w-full text-xs daily-salespeople-table">
        <TableHeader />
        <tbody>
          {salespeople.map(person => (
            <SalespersonRow 
              key={person.id} 
              person={person} 
              isTopPerformer={person.id === topPerformerId}
            />
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
