
import { User } from "@/lib/types";
import { DEFAULT_GOAL_AMOUNT } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

// Fetch sales data for the current month
export const fetchMonthlySalesData = async (startDate: string, endDate: string, user: User) => {
  try {
    // Query for the current month's sales
    const { data: currentMonthData, error: currentMonthError } = await supabase
      .from('sales')
      .select('*')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate);
    
    if (currentMonthError) {
      console.error("Error fetching current month data:", currentMonthError);
      throw currentMonthError;
    }
    
    // Filter by salesperson if user is a salesperson
    let filteredCurrentData = currentMonthData || [];
    if (user.role === 'vendedor') {
      filteredCurrentData = filteredCurrentData.filter(sale => sale.salesperson_id === user.id);
    }
    
    return filteredCurrentData;
  } catch (error) {
    console.error("Error in fetchMonthlySalesData:", error);
    return [];
  }
};

// Fetch sales data for the previous month
export const fetchPreviousMonthSalesData = async (startDate: string, endDate: string, user: User) => {
  try {
    const { data: prevMonthData, error: prevMonthError } = await supabase
      .from('sales')
      .select('*')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate);
    
    if (prevMonthError) {
      console.error("Error fetching previous month data:", prevMonthError);
      throw prevMonthError;
    }
    
    let filteredPrevData = prevMonthData || [];
    if (user.role === 'vendedor') {
      filteredPrevData = filteredPrevData.filter(sale => sale.salesperson_id === user.id);
    }
    
    return filteredPrevData;
  } catch (error) {
    console.error("Error in fetchPreviousMonthSalesData:", error);
    return [];
  }
};

// Fetch monthly goal
export const fetchMonthlyGoal = async (currentMonth: number, currentYear: number) => {
  try {
    console.log(`Buscando meta para mês ${currentMonth}/${currentYear}`);
    
    const { data: goalData, error: goalError } = await supabase
      .from('monthly_goals')
      .select('goal_amount')
      .eq('month', currentMonth)
      .eq('year', currentYear);
      
    if (goalError) {
      console.error("Erro ao buscar meta:", goalError);
      throw goalError;
    }
    
    console.log("Dados de meta recebidos:", goalData);
    
    // Check if we have goal data and return the highest goal amount if there are multiple goals
    if (goalData && goalData.length > 0) {
      // If there are multiple goals, take the highest one
      if (goalData.length > 1) {
        const goals = goalData.map(g => g.goal_amount);
        const highestGoal = Math.max(...goals);
        console.log(`Múltiplas metas encontradas, usando a maior: ${highestGoal}`);
        return highestGoal;
      }
      return goalData[0].goal_amount;
    }
    
    console.log("Nenhuma meta encontrada, usando valor padrão");
    return DEFAULT_GOAL_AMOUNT; // Default goal amount if none is found
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    return DEFAULT_GOAL_AMOUNT; // Default goal amount in case of error
  }
};
