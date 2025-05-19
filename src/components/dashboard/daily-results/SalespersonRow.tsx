
import { DailySalesperson } from "./types";
import { formatCurrency } from "@/lib/utils";

interface SalespersonRowProps {
  person: DailySalesperson;
}

const SalespersonRow = ({ person }: SalespersonRowProps) => {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="p-2 text-center">{person.proposalsCount || 0}</td>
      <td className="p-2 text-right">{person.feesAmount ? formatCurrency(person.feesAmount) : 'R$ 0,00'}</td>
      <td className="p-2 font-medium">{person.name}</td>
      <td className="p-2 text-right">{person.salesCount}</td>
      <td className="p-2 text-right">{formatCurrency(person.salesAmount)}</td>
    </tr>
  );
};

export default SalespersonRow;
