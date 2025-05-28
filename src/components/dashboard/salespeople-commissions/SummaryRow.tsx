
import { SummaryTotals } from "./types";

interface SummaryRowProps {
  summaryTotals: SummaryTotals;
}

export function SummaryRow({ summaryTotals }: SummaryRowProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatGap = (gap: number) => {
    const sign = gap >= 0 ? '+' : '-';
    const absValue = Math.abs(gap);
    return `${formatCurrency(absValue)}${sign}`;
  };

  return (
    <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-medium bg-gray-50 dark:bg-gray-700">
      <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">TOTAL</td>
      <td className="text-center py-3 px-2 text-gray-900 dark:text-white">{summaryTotals.salesCount}</td>
      <td className="text-center py-3 px-2">
        <span className="text-gray-500 dark:text-gray-400">-</span>
      </td>
      <td className="text-center py-3 px-2 font-semibold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(summaryTotals.totalSales)}
      </td>
      <td className="text-center py-3 px-2 text-gray-900 dark:text-white">
        {formatCurrency(summaryTotals.goalAmount)}
      </td>
      <td className="text-center py-3 px-2">
        <div className="flex items-center justify-center">
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{
                width: `${Math.min(Math.round(summaryTotals.goalPercentage), 100)}%`
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round(summaryTotals.goalPercentage)}%
          </span>
        </div>
      </td>
      <td className="text-center py-3 px-2">
        <span className={`font-medium ${
          summaryTotals.metaGap >= 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {formatGap(summaryTotals.metaGap)}
        </span>
      </td>
      <td className="text-center py-3 px-2 text-gray-900 dark:text-white">
        {summaryTotals.remainingDailyTarget > 0
          ? formatCurrency(summaryTotals.remainingDailyTarget)
          : <span className="text-emerald-600 dark:text-emerald-400 font-medium">Meta alcançada</span>}
      </td>
      <td className="text-center py-3 px-2 font-semibold text-blue-600 dark:text-blue-400">
        {formatCurrency(summaryTotals.projectedCommission)}
      </td>
    </tr>
  );
}
