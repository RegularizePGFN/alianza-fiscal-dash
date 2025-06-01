
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
    console.log(`=== FETCH MONTHLY GOAL DEBUG ===`);
    console.log(`User: ${user.id}, Role: ${user.role}, Month: ${currentMonth}, Year: ${currentYear}`);

    // For admin users, sum all vendedor users' goals
    if (user.role === UserRole.ADMIN) {
      console.log("Fetching team goals for admin user");
      
      // First, get all vendedor users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("role", "vendedor"); // Only get vendedor users
      
      if (profilesError) {
        console.error("Error fetching vendedor profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Vendedor profiles found:", profiles?.length || 0);
      
      if (!profiles || profiles.length === 0) {
        console.log("No vendedor users found, using default goal");
        return DEFAULT_GOAL_AMOUNT;
      }
      
      // Get the user IDs of all vendedor users
      const vendedorUserIds = profiles.map(profile => profile.id);
      console.log("Vendedor user IDs:", vendedorUserIds);
      
      // Get goals for all vendedor users for the current month/year
      const { data: goalsData, error: goalsError } = await supabase
        .from("monthly_goals")
        .select("goal_amount, user_id")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .in("user_id", vendedorUserIds);
        
      if (goalsError) {
        console.error("Error fetching goals:", goalsError);
        throw goalsError;
      }
      
      console.log("Goals data fetched:", goalsData);
      
      if (goalsData && goalsData.length > 0) {
        // Sum all vendedor goals
        const totalGoal = goalsData.reduce((sum, goal) => {
          const goalAmount = typeof goal.goal_amount === 'string' 
            ? parseFloat(goal.goal_amount) 
            : Number(goal.goal_amount);
          
          console.log(`Adding goal for user ${goal.user_id}: ${goalAmount}`);
          return sum + (isNaN(goalAmount) ? 0 : goalAmount);
        }, 0);
        
        console.log(`Total team goal calculated: ${totalGoal} from ${goalsData.length} vendedor goals`);
        return totalGoal > 0 ? totalGoal : DEFAULT_GOAL_AMOUNT;
      }
      
      // If no goals found for vendedores, use default * number of vendedores
      const defaultTeamGoal = DEFAULT_GOAL_AMOUNT * profiles.length;
      console.log(`No goals found for vendedores, using default * ${profiles.length} = ${defaultTeamGoal}`);
      return defaultTeamGoal;
    } 
    // For vendedor users, get their specific goal
    else {
      console.log(`Fetching individual goal for vendedor (user_id: ${user.id})`);
      
      const { data: goalData, error: goalError } = await supabase
        .from("monthly_goals")
        .select("goal_amount")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("user_id", user.id)
        .maybeSingle();

      if (goalError) {
        console.error("Error fetching individual goal:", goalError);
        return DEFAULT_GOAL_AMOUNT;
      }

      if (goalData && goalData.goal_amount) {
        const goalAmount = typeof goalData.goal_amount === 'string' 
          ? parseFloat(goalData.goal_amount) 
          : Number(goalData.goal_amount);
        console.log("Individual goal found:", goalAmount);
        return isNaN(goalAmount) ? DEFAULT_GOAL_AMOUNT : goalAmount;
      }
      
      console.log("No individual goal configured, using default");
      return DEFAULT_GOAL_AMOUNT;
    }
  } catch (error: any) {
    console.error("Error fetching goal:", error);
    return DEFAULT_GOAL_AMOUNT;
  }
};
