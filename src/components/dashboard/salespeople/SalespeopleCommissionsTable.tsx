
import { SalespersonCommission } from "@/services/salespeople";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

interface SalespeopleCommissionsTableProps {
  salespeople: SalespersonCommission[];
}

export function SalespeopleCommissionsTable({ salespeople }: SalespeopleCommissionsTableProps) {
  // Calculate working days and days passed
  const workdayStats = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Get total working days in the month
    const totalWorkingDays = getBusinessDaysInMonth(currentYear, currentMonth);
    
    // Get working days passed so far
    const workingDaysPassed = getBusinessDaysPassed(currentYear, currentMonth, today.getDate());
    
    return {
      total: totalWorkingDays,
      passed: workingDaysPassed,
      ratio: workingDaysPassed / totalWorkingDays
    };
  }, []);
  
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-center py-2 font-medium">Vendedor</th>
            <th className="text-center py-2 font-medium">Total de Vendas</th>
            <th className="text-center py-2 font-medium">Total R$</th>
            <th className="text-center py-2 font-medium">Meta</th>
            <th className="text-center py-2 font-medium">% da Meta</th>
            <th className="text-center py-2 font-medium">GAP Meta</th>
            <th className="text-center py-2 font-medium">Comissão Projetada</th>
          </tr>
        </thead>
        <tbody>
          {salespeople.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-4 text-center text-gray-500">
                Nenhum vendedor encontrado
              </td>
            </tr>
          ) : (
            salespeople.map((person) => {
              // Calculate expected goal at this point in time
              const expectedGoalAmount = person.goalAmount * workdayStats.ratio;
              const goalGap = person.totalSales - expectedGoalAmount;
              const isAheadOfGoal = goalGap >= 0;
              
              return (
                <tr key={person.id} className="border-b border-gray-100">
                  <td className="py-3 text-center">{person.name}</td>
                  
                  {/* New column: Sales count */}
                  <td className="text-center py-3">
                    {person.salesCount}
                  </td>
                  
                  {/* Changed column name: Total R$ */}
                  <td className="text-center py-3">
                    {formatCurrency(person.totalSales)}
                  </td>
                  
                  <td className="text-center py-3">
                    {formatCurrency(person.goalAmount)}
                  </td>
                  
                  {/* Modified % column with colored progress bar */}
                  <td className="text-center py-3">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            isAheadOfGoal ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{
                            width: `${person.goalPercentage}%`
                          }}
                        />
                      </div>
                      <span>{person.goalPercentage.toFixed(0)}%</span>
                    </div>
                  </td>
                  
                  {/* New GAP Meta column */}
                  <td className="text-center py-3">
                    <span className={isAheadOfGoal ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {formatCurrency(Math.abs(goalGap))}
                      {isAheadOfGoal ? '+' : '-'}
                    </span>
                  </td>
                  
                  <td className="text-center py-3 font-medium">
                    {formatCurrency(person.projectedCommission)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to calculate business days in month
function getBusinessDaysInMonth(year: number, month: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate();
  let businessDays = 0;
  
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  
  return businessDays;
}

// Helper function to calculate business days passed so far
function getBusinessDaysPassed(year: number, month: number, currentDay: number): number {
  let businessDaysPassed = 0;
  
  for (let day = 1; day <= currentDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysPassed++;
    }
  }
  
  return businessDaysPassed;
}
