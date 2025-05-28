
import { SummaryTotals } from "./types";

interface SummaryRowProps {
  summaryTotals: SummaryTotals;
}

export function SummaryRow({ summaryTotals }: SummaryRowProps) {
  return (
    <tr className="border-t-2 border-gray-300 font-medium">
      <td className="py-3 text-center">TOTAL</td>
      <td className="text-center py-3">{summaryTotals.salesCount}</td>
      <td className="text-center py-3">
        <span className="text-gray-600">-</span>
      </td>
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
        {Math.round(summaryTotals.goalPercentage)}%
      </td>
      <td className="text-center py-3">
        {summaryTotals.metaGap >= 0
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
      <td className="text-center py-3">
        {summaryTotals.projectedCommission.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
      </td>
    </tr>
  );
}
