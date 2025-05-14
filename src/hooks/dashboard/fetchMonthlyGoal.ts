
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";

/**
 * Fetches the monthly goal for a user
 */
export const fetchMonthlyGoal = async (
  user: { id: string; role: UserRole } | null,
  currentMonth: number,
  currentYear: number
) => {
  if (!user) return DEFAULT_GOAL_AMOUNT;

  try {
    // For admin users, sum all users' goals
    if (user.role === UserRole.ADMIN) {
      console.log("Fetching total goals for admin user");
      
      // Get all goals for the current month/year
      const { data: goalsData, error: goalsError } = await supabase
        .from("monthly_goals")
        .select("goal_amount, user_id")
        .eq("month", currentMonth)
        .eq("year", currentYear);
        
      if (goalsError) {
        console.error("Erro ao buscar metas:", goalsError);
        throw goalsError;
      }
      
      console.log("Metas obtidas:", goalsData);
      
      // Get profiles to identify salespeople
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role");
      
      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        throw profilesError;
      }
      
      // Create a map of user roles for quick lookup
      const userRoles = new Map();
      profiles?.forEach(profile => {
        userRoles.set(profile.id, profile.role?.toLowerCase());
      });
      
      console.log("Mapa de perfis:", Array.from(userRoles.entries()));
      
      // Filter goals to include ONLY goals for salespeople, NOT admins
      const salesGoals = goalsData?.filter(goal => {
        const userRole = userRoles.get(goal.user_id);
        // Só incluir vendedores, excluir explicitamente admins
        return userRole && userRole !== 'admin';
      });
      
      console.log("Metas filtradas de vendedores:", salesGoals);
      
      if (salesGoals && salesGoals.length > 0) {
        // Sum goals for salespeople only
        // Fix: Ensure goal_amount is treated as a number before adding it to the sum
        const totalGoal = salesGoals.reduce((sum, goal) => {
          // Parse goal_amount as number to ensure correct addition
          const goalAmount = typeof goal.goal_amount === 'string' 
            ? parseFloat(goal.goal_amount) 
            : Number(goal.goal_amount);
          
          return sum + (isNaN(goalAmount) ? 0 : goalAmount);
        }, 0);
        
        console.log(`Meta total para admins (soma de ${salesGoals.length} metas de vendedores):`, totalGoal);
        return totalGoal > 0 ? totalGoal : DEFAULT_GOAL_AMOUNT;
      }
      
      // If no explicit goals are found, use default goal amount
      console.log("Nenhuma meta encontrada para vendedores, usando valor padrão");
      return DEFAULT_GOAL_AMOUNT;
    } 
    // For regular users (vendedores), just get their specific goal
    else {
      console.log(`Buscando meta para vendedor (user_id: ${user.id})`);
      
      const { data: goalData, error: goalError } = await supabase
        .from("monthly_goals")
        .select("goal_amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("user_id", user.id)
        .maybeSingle();

      if (goalError) {
        console.error("Erro ao buscar meta:", goalError);
        return DEFAULT_GOAL_AMOUNT;
      }

      if (goalData && goalData.goal_amount) {
        console.log("Meta mensal encontrada:", goalData.goal_amount);
        return typeof goalData.goal_amount === 'string' 
          ? parseFloat(goalData.goal_amount) 
          : Number(goalData.goal_amount);
      }
      
      console.log("Nenhuma meta configurada para este vendedor, usando valor padrão");
      return DEFAULT_GOAL_AMOUNT;
    }
  } catch (error: any) {
    console.error("Erro ao buscar meta:", error);
    return DEFAULT_GOAL_AMOUNT;
  }
};
