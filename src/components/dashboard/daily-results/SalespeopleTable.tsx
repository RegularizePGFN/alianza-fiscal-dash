
import { TableHeader } from "./TableHeader";
import SalespersonRow from "./SalespersonRow";
import { DailySalesperson } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SalespeopleTableProps {
  salespeople: DailySalesperson[];
}

export function SalespeopleTable({ salespeople }: SalespeopleTableProps) {
  return (
    <ScrollArea className="h-[150px]">
      <table className="w-full text-xs daily-salespeople-table">
        <TableHeader />
        <tbody>
          {salespeople.map(person => (
            <SalespersonRow key={person.id} person={person} />
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
