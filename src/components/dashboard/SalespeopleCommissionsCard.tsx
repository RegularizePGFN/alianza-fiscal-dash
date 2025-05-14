import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { LoadingSpinner } from "../ui/loading-spinner";

type SalespersonCommission = {
  id: string;
  name: string;
  totalSales: number;
  goalAmount: number;
  projectedCommission: number;
  goalPercentage: number;
  salesCount: number;
  metaGap: number;
  expectedProgress: number;
};

// Função para contar dias úteis do mês
function getBusinessDaysInMonth(month: number, year: number): number {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month - 1, i);
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

// Função para contar dias úteis até hoje
function getBusinessDaysElapsedUntilToday(): number {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  let count = 0;
  for (let i = 1; i <= day; i++) {
    const date = new Date(year, month, i);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) {
      count++;
    }
  }
  return count;
}

export function SalespeopleCommissionsCard() {
  const [salespeople, setSalespeople] = useState<SalespersonCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  useEffect(() => {
    const fetchSalespeopleCommissions = async () => {
      try {
        setLoading(true);

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const totalBusinessDays = getBusinessDaysInMonth(currentMonth, currentYear);
        const businessDaysElapsed = getBusinessDaysElapsedUntilToday();

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "vendedor");

        if (profilesError) {
          console.error("Error fetching salespeople:", profilesError);
          return;
        }

        const commissionData = await Promise.all(
          profilesData.map(async (profile) => {
            const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
            const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

            const { data: salesData, error: salesError } = await supabase
              .from("sales")
              .select("*")
              .eq("salesperson_id", profile.id)
              .gte("sale_date", startDate)
              .lte("sale_date", endDate);

            if (salesError) {
              console.error(`Error fetching sales for ${profile.name}:`, salesError);
              return null;
            }

            const { data: goalData } = await supabase
              .from("monthly_goals")
              .select("goal_amount")
              .eq("user_id", profile.id)
              .eq("month", currentMonth)
              .eq("year", currentYear)
              .maybeSingle();

            const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.gross_amount), 0) || 0;
            const salesCount = salesData?.length || 0;
            const goalAmount = goalData?.goal_amount ? Number(goalData.goal_amount) : 0;

            const dailyTarget = goalAmount / totalBusinessDays;
            const expectedProgress = dailyTarget * businessDaysElapsed;
            const metaGap = totalSales - expectedProgress;

            const commissionRate = totalSales >= goalAmount ? 0.25 : 0.2;
            const projectedCommission = totalSales * commissionRate;

            const goalPercentage = expectedProgress > 0
              ? (totalSales / expectedProgress) * 100
              : 0;

            return {
              id: profile.id,
              name: profile.name || "Sem nome",
              totalSales,
              goalAmount,
              projectedCommission,
              goalPercentage,
              salesCount,
              metaGap,
              expectedProgress
            };
          })
        );

        const validCommissions = commissionData
          .filter(Boolean)
          .sort((a, b) => a!.name.localeCompare(b!.name));

        setSalespeople(validCommissions as SalespersonCommission[]);
      } catch (error) {
        console.error("Error fetching salespeople commissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalespeopleCommissions();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Projeção de Comissões (Vendedores)</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Projeção de Comissões (Vendedores)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-2 font-medium">Vendedor</th>
                <th className="text-center py-2 font-medium">Total Vendas</th>
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
                  const isAheadOfTarget = person.metaGap >= 0;

                  return (
                    <tr key={person.id} className="border-b border-gray-100">
                      <td className="py-3 text-center">{person.name}</td>
                      <td className="text-center py-3">{person.salesCount}</td>
                      <td className="text-center py-3">{person.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="text-center py-3">{person.goalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className={`h-2 rounded-full ${isAheadOfTarget ? 'bg-blue-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(person.goalPercentage, 100)}%` }}
                            />
                          </div>
                          <span>{person.goalPercentage.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className={`text-center py-3 ${isAheadOfTarget ? 'text-green-600' : 'text-red-600'} font-medium`}>
                        {isAheadOfTarget 
                          ? 'R$ ' + Math.abs(person.metaGap).toFixed(2).replace('.', ',') + '+' 
                          : 'R$ ' + Math.abs(person.metaGap).toFixed(2).replace('.', ',') + '-'}
                      </td>
                      <td className="text-center py-3 font-medium">
                        {person.projectedCommission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
