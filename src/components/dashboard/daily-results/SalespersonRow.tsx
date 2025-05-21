
import { DailySalesperson } from "./types";
import { formatCurrency } from "@/lib/utils";

interface SalespersonRowProps {
  person: DailySalesperson;
}

export default function SalespersonRow({ person }: SalespersonRowProps) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="py-1.5 px-2 border-b border-r border-border/30 whitespace-nowrap">
        {person.name}
      </td>
      <td className="py-1.5 px-2 border-b border-r border-border/30 text-center">
        {person.salesCount}
      </td>
      <td className="py-1.5 px-2 border-b border-r border-border/30 text-center">
        {formatCurrency(person.salesAmount)}
      </td>
      <td className="py-1.5 px-2 border-b border-r border-border/30 text-center">
        {person.proposalsCount || 0}
      </td>
      <td className="py-1.5 px-2 border-b border-border/30 text-center">
        {formatCurrency(person.feesAmount || 0)}
      </td>
    </tr>
  );
}
