
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
      console.log(`[ADMIN] Fetching total goals for admin user for ${currentMonth}/${currentYear}`);
      
      // First, get all profiles to identify salespeople
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role, email");
      
      if (profilesError) {
        console.error("Erro ao buscar perfis:", profilesError);
        throw profilesError;
      }
      
      console.log("Todos os perfis encontrados:", profiles);
      
      // Filter to get ONLY salespeople (exclude admins by email and role)
      const salespeopleIds = profiles
        ?.filter(profile => {
          const email = profile.email?.toLowerCase() || '';
          const role = profile.role?.toLowerCase() || '';
          
          // Exclude if email is in admin list OR role is admin
          const isAdminByEmail = ADMIN_EMAILS.includes(email);
          const isAdminByRole = role === 'admin';
          const isSalesperson = role === 'vendedor' || role === 'salesperson';
          
          console.log(`Profile ${profile.id} (${email}, ${role}):`);
          console.log(`  - É admin por email: ${isAdminByEmail}`);
          console.log(`  - É admin por role: ${isAdminByRole}`);
          console.log(`  - É vendedor: ${isSalesperson}`);
          
          const shouldInclude = !isAdminByEmail && !isAdminByRole && isSalesperson;
          console.log(`  - Incluir: ${shouldInclude}`);
          
          return shouldInclude;
        })
        ?.map(profile => profile.id) || [];
      
      console.log("IDs dos vendedores filtrados:", salespeopleIds);
      
      if (salespeopleIds.length === 0) {
        console.log("Nenhum vendedor encontrado, retornando meta padrão");
        return DEFAULT_GOAL_AMOUNT;
      }
      
      // Now get goals only for these salespeople for the current month/year
      const { data: goalsData, error: goalsError } = await supabase
        .from("monthly_goals")
        .select("goal_amount, user_id")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .in("user_id", salespeopleIds);
        
      if (goalsError) {
        console.error("Erro ao buscar metas dos vendedores:", goalsError);
        throw goalsError;
      }
      
      console.log(`Metas encontradas para vendedores em ${currentMonth}/${currentYear}:`, goalsData);
      
      if (goalsData && goalsData.length > 0) {
        // Sum all salespeople goals
        const totalGoal = goalsData.reduce((sum, goal) => {
          const goalAmount = typeof goal.goal_amount === 'string' 
            ? parseFloat(goal.goal_amount) 
            : Number(goal.goal_amount);
          
          const validAmount = isNaN(goalAmount) ? 0 : goalAmount;
          console.log(`Somando meta: R$ ${validAmount} (user_id: ${goal.user_id})`);
          return sum + validAmount;
        }, 0);
        
        console.log(`[ADMIN] Meta total da equipe calculada: R$ ${totalGoal} (${goalsData.length} vendedores)`);
        return totalGoal > 0 ? totalGoal : DEFAULT_GOAL_AMOUNT;
      }
      
      console.log("Nenhuma meta encontrada para os vendedores, usando valor padrão");
      return DEFAULT_GOAL_AMOUNT;
    } 
    // For regular users (vendedores), just get their specific goal
    else {
      console.log(`[VENDEDOR] Buscando meta individual para vendedor (user_id: ${user.id}) - ${currentMonth}/${currentYear}`);
      
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
        console.log(`[VENDEDOR] Meta individual encontrada: R$ ${goalAmount}`);
        return goalAmount;
      }
      
      console.log("[VENDEDOR] Nenhuma meta individual configurada, usando valor padrão");
      return DEFAULT_GOAL_AMOUNT;
    }
  } catch (error: any) {
    console.error("Erro ao buscar meta:", error);
    return DEFAULT_GOAL_AMOUNT;
  }
};
