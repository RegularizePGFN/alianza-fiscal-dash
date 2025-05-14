
import { Separator } from "@/components/ui/separator";
import { SummaryTotals } from "./types";

interface SummaryRowProps {
  summaryTotals: SummaryTotals;
}

export function SummaryRow({ summaryTotals }: SummaryRowProps) {
  const isAheadOfTargetTotal = summaryTotals.metaGap >= 0;
  
  return (
    <>
      <tr className="border-t border-gray-300">
        <td colSpan={8} className="py-1">
          <Separator className="h-px bg-gray-300 w-full" />
        </td>
      </tr>
      <tr className="bg-gray-50 font-semibold">
        <td className="py-3 text-center">TOTAL</td>
        <td className="text-center py-3">{summaryTotals.salesCount}</td>
        <td className="text-center py-3">
          {summaryTotals.totalSales.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </td>
        <td className="text-center py-3">
          {summaryTotals.goalAmount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </td>
        <td className="text-center py-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
              <div
                className={`h-2 rounded-full ${
                  isAheadOfTargetTotal ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(summaryTotals.goalPercentage, 100)}%`
                }}
              />
            </div>
            <span>{summaryTotals.goalPercentage.toFixed(0)}%</span>
          </div>
        </td>
        <td
          className={`text-center py-3 ${
            isAheadOfTargetTotal ? 'text-green-600' : 'text-red-600'
          } font-medium`}
        >
          {isAheadOfTargetTotal
            ? 'R$ ' + Math.abs(summaryTotals.metaGap).toFixed(2).replace('.', ',') + '+'
            : 'R$ ' + Math.abs(summaryTotals.metaGap).toFixed(2).replace('.', ',') + '-'}
        </td>
        <td className="text-center py-3">
          {summaryTotals.remainingDailyTarget > 0
            ? summaryTotals.remainingDailyTarget.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })
            : 'Meta alcançada'}
        </td>
        <td className="text-center py-3 font-medium">
          {summaryTotals.projectedCommission.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </td>
      </tr>
    </>
  );
}
