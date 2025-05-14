
import { SalespersonCommission } from "@/services/salespeople";

interface SalespeopleCommissionsTableProps {
  salespeople: SalespersonCommission[];
}

export function SalespeopleCommissionsTable({ salespeople }: SalespeopleCommissionsTableProps) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 font-medium">Vendedor</th>
            <th className="text-right py-2 font-medium">Total Vendido</th>
            <th className="text-right py-2 font-medium">Meta</th>
            <th className="text-right py-2 font-medium">% da Meta</th>
            <th className="text-right py-2 font-medium">Comissão Projetada</th>
          </tr>
        </thead>
        <tbody>
          {salespeople.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-gray-500">
                Nenhum vendedor encontrado
              </td>
            </tr>
          ) : (
            salespeople.map((person) => (
              <tr key={person.id} className="border-b border-gray-100">
                <td className="py-3">{person.name}</td>
                <td className="text-right py-3">
                  {person.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="text-right py-3">
                  {person.goalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="text-right py-3">
                  <div className="flex items-center justify-end">
                    <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                      <div
                        className={`h-2 rounded-full ${
                          person.goalPercentage >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${person.goalPercentage}%`
                        }}
                      />
                    </div>
                    <span>{person.goalPercentage.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="text-right py-3 font-medium">
                  {person.projectedCommission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
