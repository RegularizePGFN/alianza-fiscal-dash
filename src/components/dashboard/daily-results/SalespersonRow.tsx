
import { DailySalesperson } from "./types";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalespersonRowProps {
  person: DailySalesperson;
  isTopPerformer?: boolean;
}

export default function SalespersonRow({ person, isTopPerformer }: SalespersonRowProps) {
  return (
    <tr className={cn(
      "hover:bg-muted/30 transition-colors",
      isTopPerformer && "bg-amber-50/50 dark:bg-amber-900/10"
    )}>
      <td className="py-2 px-3 border-b border-border/30 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {isTopPerformer && (
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className={cn(isTopPerformer && "font-medium")}>{person.name}</span>
        </div>
      </td>
      <td className="py-2 px-3 border-b border-border/30 text-center font-medium">
        {person.salesCount}
      </td>
      <td className="py-2 px-3 border-b border-border/30 text-right font-mono tabular-nums">
        {formatCurrency(person.salesAmount)}
      </td>
      <td className="py-2 px-3 border-b border-border/30 text-center">
        {person.proposalsCount || 0}
      </td>
      <td className="py-2 px-3 border-b border-border/30 text-right font-mono tabular-nums">
        {formatCurrency(person.feesAmount || 0)}
      </td>
    </tr>
  );
}
