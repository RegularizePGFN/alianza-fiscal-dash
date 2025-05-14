
import { formatCurrency } from "@/lib/utils";
import { SalespersonCommission } from "./types";
import { COMMISSION_TRIGGER_GOAL } from "@/lib/constants";

export function SalespersonRow({ person }: { person: SalespersonCommission }) {
  const {
    name,
    salesCount,
    totalSales,
    goalAmount,
    goalPercentage,
    metaGap,
    remainingDailyTarget,
    projectedCommission
  } = person;
  
  // Check if commission trigger goal was achieved
  const commissionGoalAchieved = totalSales >= COMMISSION_TRIGGER_GOAL;
  const commissionRate = commissionGoalAchieved ? 0.25 : 0.2;
  
  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-2 py-3 text-sm">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Taxa: {(commissionRate * 100).toFixed(0)}%
          {commissionGoalAchieved ? 
            " (Meta de comissão atingida)" : 
            ` (Faltam ${formatCurrency(COMMISSION_TRIGGER_GOAL - totalSales)} para 25%)`
          }
        </div>
      </td>
      <td className="px-2 py-3 text-center">{salesCount}</td>
      <td className="px-2 py-3 text-right font-medium">
        {formatCurrency(totalSales)}
        <div className="text-xs text-muted-foreground">
          {Math.round(goalPercentage)}% da meta
        </div>
      </td>
      <td className="px-2 py-3 text-right">
        <span className={metaGap >= 0 ? "text-af-green-500" : "text-red-500"}>
          {formatCurrency(metaGap)}
        </span>
      </td>
      <td className="px-2 py-3 text-right">
        {remainingDailyTarget > 0 ? formatCurrency(remainingDailyTarget) : "Meta atingida!"}
      </td>
      <td className="px-2 py-3 text-right">{formatCurrency(projectedCommission)}</td>
    </tr>
  );
}
