
import { SalespersonCommission } from "./types";

interface SalespersonRowProps {
  person: SalespersonCommission;
}

export function SalespersonRow({ person }: SalespersonRowProps) {
  const isAheadOfTarget = person.metaGap >= 0;
  
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 text-center">{person.name}</td>
      <td className="text-center py-3">{person.salesCount}</td>
      <td className="text-center py-3">
        {person.totalSales.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
      </td>
      <td className="text-center py-3">
        {person.goalAmount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
      </td>
      <td className="text-center py-3">
        <div className="flex items-center justify-center">
          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
            <div
              className={`h-2 rounded-full ${
                isAheadOfTarget ? 'bg-blue-500' : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min(person.goalPercentage, 100)}%`
              }}
            />
          </div>
          <span>{person.goalPercentage.toFixed(0)}%</span>
        </div>
      </td>
      <td
        className={`text-center py-3 ${
          isAheadOfTarget ? 'text-green-600' : 'text-red-600'
        } font-medium`}
      >
        {isAheadOfTarget
          ? 'R$ ' + Math.abs(person.metaGap).toFixed(2).replace('.', ',') + '+'
          : 'R$ ' + Math.abs(person.metaGap).toFixed(2).replace('.', ',') + '-'}
      </td>
      <td className="text-center py-3">
        {person.remainingDailyTarget > 0
          ? person.remainingDailyTarget.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })
          : 'Meta alcançada'}
      </td>
      <td className="text-center py-3 font-medium">
        {person.projectedCommission.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
      </td>
    </tr>
  );
}
