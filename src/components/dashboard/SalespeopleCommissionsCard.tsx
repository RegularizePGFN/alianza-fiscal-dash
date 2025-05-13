import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { LoadingSpinner } from "../ui/loading-spinner";
import { toast } from "@/components/ui/use-toast";

type SalespersonCommission = {
  id: string;
  name: string;
  totalSales: number;
  goalAmount: number;
  projectedCommission: number;
  goalPercentage: number;
};

export function SalespeopleCommissionsCard() {
  const [salespeople, setSalespeople] = useState<SalespersonCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSalespeopleCommissions = async () => {
      try {
        setLoading(true);
        
        // Get current month/year
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        // 1. Fetch all salespeople (users with role 'vendedor')
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "vendedor");
        
        if (profilesError) {
          console.error("Error fetching salespeople:", profilesError);
          toast({
            title: "Erro",
            description: "Falha ao carregar dados dos vendedores",
            variant: "destructive"
          });
          return;
        }
        
        // Process each salesperson
        const commissionData = await Promise.all(
          profilesData.map(async (profile) => {
            // 2. Get their sales for current month
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
            
            // 3. Get their monthly goal
            // The monthly_goals table expects month and year as integers (numbers)
            const { data: goalData, error: goalError } = await supabase
              .from("monthly_goals")
              .select("goal_amount")
              .eq("user_id", profile.id)
              .eq("month", currentMonth) // Use the number directly, not a string
              .eq("year", currentYear) // Use the number directly, not a string
              .maybeSingle();
              
            // Calculate total sales
            const totalSales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.gross_amount), 0) || 0;
            
            // Get goal amount (default to 0 if not set)
            const goalAmount = goalData?.goal_amount ? parseFloat(goalData.goal_amount) : 0;
            
            // Calculate commission rate based on goal achievement
            const commissionRate = totalSales >= goalAmount ? 0.25 : 0.2; // 25% if goal met, 20% otherwise
            const projectedCommission = totalSales * commissionRate;
            
            // Calculate goal percentage (cap at 200%)
            const goalPercentage = goalAmount > 0 ? Math.min((totalSales / goalAmount) * 100, 200) : 0;
            
            return {
              id: profile.id,
              name: profile.name || "Sem nome",
              totalSales,
              goalAmount,
              projectedCommission,
              goalPercentage
            };
          })
        );
        
        // Filter out any null values and sort by name
        const validCommissions = commissionData
          .filter(Boolean)
          .sort((a, b) => a!.name.localeCompare(b!.name));
          
        setSalespeople(validCommissions as SalespersonCommission[]);
      } catch (error) {
        console.error("Error fetching salespeople commissions:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar comissões dos vendedores",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalespeopleCommissions();
  }, []);

  // Only admins should see this component
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

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
      </CardContent>
    </Card>
  );
}
