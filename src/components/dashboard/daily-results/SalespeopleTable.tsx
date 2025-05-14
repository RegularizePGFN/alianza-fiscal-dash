
import { TableHeader } from "./TableHeader";
import { SalespersonRow } from "./SalespersonRow";
import { DailySalesperson } from "./types";

interface SalespeopleTableProps {
  salespeople: DailySalesperson[];
}

export function SalespeopleTable({ salespeople }: SalespeopleTableProps) {
  return (
    <div className="max-h-[120px] overflow-y-auto pr-2">
      <table className="w-full text-xs">
        <TableHeader />
        <tbody>
          {salespeople.map(person => (
            <SalespersonRow key={person.id} person={person} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
