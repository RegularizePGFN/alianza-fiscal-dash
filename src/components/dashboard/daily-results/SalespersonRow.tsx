
import { formatCurrency } from "@/lib/utils";
import { DailySalesperson } from "./types";

interface SalespersonRowProps {
  person: DailySalesperson;
}

export function SalespersonRow({ person }: SalespersonRowProps) {
  return (
    <tr key={person.id} className="border-b border-gray-50">
      <td className="py-1 text-left">{person.name}</td>
      <td className="text-center py-1">{person.salesCount}</td>
      <td className="text-right py-1">{formatCurrency(person.salesAmount)}</td>
    </tr>
  );
}
