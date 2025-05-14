
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type SalespersonCommission = {
  id: string;
  name: string;
  salesCount: number;  // Added sales count
  totalSales: number;
  goalAmount: number;
  projectedCommission: number;
  goalPercentage: number;
};

export async function fetchSalespeopleCommissions(): Promise<SalespersonCommission[]> {
  try {
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
      return [];
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
        const { data: goalData, error: goalError } = await supabase
          .from("monthly_goals")
          .select("goal_amount")
          .eq("user_id", profile.id)
          .eq("month", currentMonth)
          .eq("year", currentYear)
          .maybeSingle();
          
        // Calculate total sales
        const totalSales = salesData?.reduce((sum, sale) => sum + parseFloat(sale.gross_amount.toString()), 0) || 0;
        
        // Get count of sales
        const salesCount = salesData?.length || 0;
        
        // Get goal amount (default to 0 if not set)
        const goalAmount = goalData?.goal_amount ? parseFloat(goalData.goal_amount.toString()) : 0;
        
        // Calculate commission rate based on goal achievement
        const commissionRate = totalSales >= goalAmount ? 0.25 : 0.2; // 25% if goal met, 20% otherwise
        const projectedCommission = totalSales * commissionRate;
        
        // Calculate goal percentage (cap at 200%)
        const goalPercentage = goalAmount > 0 ? Math.min((totalSales / goalAmount) * 100, 200) : 0;
        
        return {
          id: profile.id,
          name: profile.name || "Sem nome",
          salesCount, // Add the sales count
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
      
    return validCommissions as SalespersonCommission[];
  } catch (error) {
    console.error("Error fetching salespeople commissions:", error);
    toast({
      title: "Erro",
      description: "Falha ao carregar comissões dos vendedores",
      variant: "destructive"
    });
    return [];
  }
}
