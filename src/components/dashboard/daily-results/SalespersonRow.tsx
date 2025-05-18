
import { formatCurrency } from "@/lib/utils";
import { DailySalesperson } from "./types";
import { User, AlertCircle } from "lucide-react";

interface SalespersonRowProps {
  salesperson: DailySalesperson;
}

export function SalespersonRow({ salesperson }: SalespersonRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors [&_td]:py-2 [&_td]:px-3 [&_td]:text-sm">
      <td className="font-medium flex items-center">
        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-2 text-gray-700">
          <User className="w-3 h-3" />
        </span>
        <span className="truncate max-w-[120px]" title={salesperson.name}>{salesperson.name}</span>
      </td>
      <td className="text-right">
        {salesperson.salesCount}
      </td>
      <td className="text-right">
        {formatCurrency(salesperson.salesAmount)}
      </td>
      <td className="text-right">
        {salesperson.proposalsCount !== undefined ? salesperson.proposalsCount : 
          <span className="text-gray-400 text-xs">N/A</span>}
      </td>
      <td className="text-right font-medium text-purple-600">
        {salesperson.feesAmount !== undefined ? formatCurrency(salesperson.feesAmount) : 
          <span className="text-gray-400 text-xs">N/A</span>}
      </td>
    </tr>
  );
}
