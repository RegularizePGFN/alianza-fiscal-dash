
import { SalespersonCommission } from "./types";

interface SalespersonRowProps {
  person: SalespersonCommission;
}

export function SalespersonRow({ person }: SalespersonRowProps) {
  const isAheadOfTarget = person.metaGap >= 0;
  
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
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="py-3 px-4 text-center font-medium text-gray-900 dark:text-white">{person.name}</td>
      <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">{person.salesCount}</td>
      <td className="text-center py-3 px-2">
        <span className={`font-medium ${
          person.zeroDaysCount > 5 
            ? 'text-red-600 dark:text-red-400' 
            : person.zeroDaysCount > 2
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {person.zeroDaysCount}
        </span>
      </td>
      <td className="text-center py-3 px-2 font-semibold text-emerald-600 dark:text-emerald-400">
        {formatCurrency(person.totalSales)}
      </td>
      <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">
        {formatCurrency(person.goalAmount)}
      </td>
      <td className="text-center py-3 px-2">
        <div className="flex items-center justify-center">
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isAheadOfTarget ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min(person.goalPercentage, 100)}%`
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {person.goalPercentage.toFixed(0)}%
          </span>
        </div>
      </td>
      <td className="text-center py-3 px-2">
        <span className={`font-medium ${
          isAheadOfTarget 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {formatGap(person.metaGap)}
        </span>
      </td>
      <td className="text-center py-3 px-2 text-gray-700 dark:text-gray-300">
        {person.remainingDailyTarget > 0
          ? formatCurrency(person.remainingDailyTarget)
          : <span className="text-emerald-600 dark:text-emerald-400 font-medium">Meta alcançada</span>}
      </td>
      <td className="text-center py-3 px-2 font-semibold text-blue-600 dark:text-blue-400">
        {formatCurrency(person.projectedCommission)}
      </td>
    </tr>
  );
}
