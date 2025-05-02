
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { UserRole } from "@/lib/types";
import { User } from "@/lib/types";

// Get the monthly sales data
export const fetchMonthlySalesData = async (
  currentStartStr: string,
  currentEndStr: string,
  user: User | null
) => {
  const { data: salesData, error } = await supabase
    .from('sales')
    .select('*')
    .gte('sale_date', currentStartStr)
    .lte('sale_date', currentEndStr)
    .order('sale_date', { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
  
  let filteredData = salesData || [];
  
  if (user?.role === UserRole.SALESPERSON) {
    filteredData = filteredData.filter(sale => sale.salesperson_id === user.id);
    console.log("Dados filtrados para vendedor (mês atual):", filteredData.length, "registros");
  }
  
  return filteredData;
};

// Get previous month sales data
export const fetchPreviousMonthSalesData = async (
  prevStartStr: string,
  prevEndStr: string,
  user: User | null
) => {
  const { data: prevMonthData, error: prevMonthError } = await supabase
    .from('sales')
    .select('*')
    .gte('sale_date', prevStartStr)
    .lte('sale_date', prevEndStr);
  
  if (prevMonthError) {
    console.error("Erro ao buscar dados do mês anterior:", prevMonthError);
    throw prevMonthError;
  }
  
  let filteredData = prevMonthData || [];
  
  if (user?.role === UserRole.SALESPERSON) {
    filteredData = filteredData.filter(sale => sale.salesperson_id === user.id);
    console.log("Dados filtrados para vendedor (mês anterior):", filteredData.length, "registros");
  }
  
  return filteredData;
};

// Fetch monthly goal
export const fetchMonthlyGoal = async (currentMonth: number, currentYear: number) => {
  try {
    const { data: goalData, error: goalError } = await supabase
      .from('monthly_goals')
      .select('goal_amount')
      .eq('month', currentMonth)
      .eq('year', currentYear);
    
    if (goalData && goalData.length > 0 && !goalError) {
      // If multiple goals are found, we'll use the highest one
      const highestGoal = goalData.reduce((max, goal) => 
        goal.goal_amount > max ? goal.goal_amount : max, 
        goalData[0].goal_amount
      );
      console.log("Meta mensal encontrada:", highestGoal, "(de", goalData.length, "registros)");
      return highestGoal;
    } else if (goalError && goalError.code !== 'PGRST116') {
      console.error('Erro ao buscar meta:', goalError);
    }
    
    console.log("Nenhuma meta encontrada, usando valor padrão:", DEFAULT_GOAL_AMOUNT);
    return DEFAULT_GOAL_AMOUNT;
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return DEFAULT_GOAL_AMOUNT;
  }
};
