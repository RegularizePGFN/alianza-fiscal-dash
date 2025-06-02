
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { ADMIN_EMAILS } from "@/contexts/auth/utils";

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
    // For admin users, sum all salespeople goals (excluding other admins)
    if (user.role === UserRole.ADMIN) {
      console.log(`Fetching total goals for admin user for ${currentMonth}/${currentYear}`);
      
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
      
      console.log("Metas obtidas para o mês:", goalsData);
      
      // Get profiles to identify salespeople (exclude admins by email and role)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role, email");
      
      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        throw profilesError;
      }
      
      console.log("Todos os perfis:", profiles);
      
      // Filter profiles to get only salespeople (exclude admins by email and role)
      const salespeopleProfiles = profiles?.filter(profile => {
        const email = profile.email?.toLowerCase() || '';
        const role = profile.role?.toLowerCase() || '';
        
        // Exclude if email is in admin list OR role is admin
        const isAdmin = ADMIN_EMAILS.includes(email) || role === 'admin';
        const isSalesperson = role === 'vendedor' || role === 'salesperson';
        
        console.log(`Profile ${profile.id} (${email}, ${role}): isAdmin=${isAdmin}, isSalesperson=${isSalesperson}`);
        
        return !isAdmin && isSalesperson;
      });
      
      console.log("Perfis de vendedores filtrados:", salespeopleProfiles);
      
      // Get goal amounts only for salespeople
      const salesGoals = goalsData?.filter(goal => {
        const isSalespersonGoal = salespeopleProfiles?.some(profile => profile.id === goal.user_id);
        console.log(`Goal for user ${goal.user_id}: isSalespersonGoal=${isSalespersonGoal}, amount=${goal.goal_amount}`);
        return isSalespersonGoal;
      });
      
      console.log("Metas de vendedores filtradas:", salesGoals);
      
      if (salesGoals && salesGoals.length > 0) {
        // Sum goals for salespeople only
        const totalGoal = salesGoals.reduce((sum, goal) => {
          const goalAmount = typeof goal.goal_amount === 'string' 
            ? parseFloat(goal.goal_amount) 
            : Number(goal.goal_amount);
          
          const validAmount = isNaN(goalAmount) ? 0 : goalAmount;
          console.log(`Adding goal amount: ${validAmount} to sum: ${sum}`);
          return sum + validAmount;
        }, 0);
        
        console.log(`Meta total da equipe (${salesGoals.length} vendedores): R$ ${totalGoal}`);
        return totalGoal > 0 ? totalGoal : DEFAULT_GOAL_AMOUNT;
      }
      
      console.log("Nenhuma meta encontrada para vendedores no mês atual, usando valor padrão");
      return DEFAULT_GOAL_AMOUNT;
    } 
    // For regular users (vendedores), just get their specific goal
    else {
      console.log(`Buscando meta individual para vendedor (user_id: ${user.id}) - ${currentMonth}/${currentYear}`);
      
      const { data: goalData, error: goalError } = await supabase
        .from("monthly_goals")
        .select("goal_amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("user_id", user.id)
        .maybeSingle();

      if (goalError) {
        console.error("Erro ao buscar meta individual:", goalError);
        return DEFAULT_GOAL_AMOUNT;
      }

      if (goalData && goalData.goal_amount) {
        const goalAmount = typeof goalData.goal_amount === 'string' 
          ? parseFloat(goalData.goal_amount) 
          : Number(goalData.goal_amount);
        console.log("Meta individual encontrada:", goalAmount);
        return goalAmount;
      }
      
      console.log("Nenhuma meta individual configurada, usando valor padrão");
      return DEFAULT_GOAL_AMOUNT;
    }
  } catch (error: any) {
    console.error("Erro ao buscar meta:", error);
    return DEFAULT_GOAL_AMOUNT;
  }
};
