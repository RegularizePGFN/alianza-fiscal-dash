
import { Sale } from "@/lib/types";
import { SalespersonData, WeeklyDataResult } from "./types";

// Helper constants for goal calculations
export const BUSINESS_DAYS_IN_MONTH = 22; // Average number of business days in a month
export const WEEKLY_GOAL_MULTIPLIER = 5; // Number of business days in a week

export const getColor = (position: number) => {
  switch (position) {
    case 1: return "bg-amber-500 dark:bg-amber-600";
    case 2: return "bg-slate-400 dark:bg-slate-500";
    case 3: return "bg-amber-700 dark:bg-amber-800";
    default: return "bg-slate-200 dark:bg-slate-700";
  }
};
  
export const getGoalStatusColor = (
  personId: string, 
  week: number, 
  amount: number, 
  weeklyGoals: WeeklyDataResult["weeklyGoals"]
) => {
  if (!weeklyGoals[personId] || !weeklyGoals[personId][week]) return "";
  
  const goal = weeklyGoals[personId][week];
  
  if (amount >= goal) {
    return "bg-green-100 dark:bg-green-900/20"; // Light green for goal achieved
  } else {
    return "bg-red-100 dark:bg-red-900/20"; // Light red for goal not achieved
  }
};

export const processWeeklyData = (salesData: Sale[]): WeeklyDataResult => {
  if (!salesData.length) return { 
    weeklyData: [], 
    availableWeeks: [], 
    currentWeek: 1,
    weeklyTotals: {},
    weeklyGoals: {}
  };
  
  // Get current date info
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Find first day of month and calculate first week start
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const dayOfWeekForFirst = firstDayOfMonth.getDay(); // 0 for Sunday
  const adjustedDayOfWeekForFirst = dayOfWeekForFirst === 0 ? 6 : dayOfWeekForFirst - 1;
  
  // Calculate current week (1-indexed)
  const dayOfMonth = now.getDate();
  const currentWeek = Math.ceil((dayOfMonth + adjustedDayOfWeekForFirst) / 7);
  
  // Initialize salesperson data map
  const salespeople: Record<string, SalespersonData> = {};
  
  // Initialize weekly totals
  const weeklyTotals: { [week: number]: { count: number; amount: number } } = {};
  
  // Process each sale into the weekly structure
  salesData.forEach(sale => {
    const saleDate = new Date(sale.sale_date);
    
    // Skip if not in the current month/year
    if (saleDate.getMonth() !== currentMonth || saleDate.getFullYear() !== currentYear) {
      return;
    }
    
    const saleDayOfMonth = saleDate.getDate();
    const saleWeek = Math.ceil((saleDayOfMonth + adjustedDayOfWeekForFirst) / 7);
    
    if (saleWeek > 6) return; // Skip if it's beyond our tracking
    
    const id = sale.salesperson_id;
    const name = sale.salesperson_name || "Desconhecido";
    
    // Initialize salesperson record if not exists
    if (!salespeople[id]) {
      salespeople[id] = {
        id,
        name,
        initials: name.split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        weeklyStats: {},
        totalCount: 0,
        totalAmount: 0
      };
    }
    
    // Initialize week stats if not exists
    if (!salespeople[id].weeklyStats[saleWeek]) {
      salespeople[id].weeklyStats[saleWeek] = {
        count: 0,
        amount: 0
      };
    }
    
    // Initialize weekly totals if not exists
    if (!weeklyTotals[saleWeek]) {
      weeklyTotals[saleWeek] = {
        count: 0,
        amount: 0
      };
    }
    
    // Update sale data
    salespeople[id].weeklyStats[saleWeek].count += 1;
    salespeople[id].weeklyStats[saleWeek].amount += sale.gross_amount;
    salespeople[id].totalCount += 1;
    salespeople[id].totalAmount += sale.gross_amount;
    
    // Update weekly totals
    weeklyTotals[saleWeek].count += 1;
    weeklyTotals[saleWeek].amount += sale.gross_amount;
  });
  
  // Find all weeks that have data
  const weeksWithData = new Set<number>();
  Object.values(salespeople).forEach(person => {
    Object.keys(person.weeklyStats).forEach(week => {
      weeksWithData.add(parseInt(week));
    });
  });
  
  // Calculate approximate monthly and weekly goals for each salesperson
  const weeklyGoals: { [id: string]: { [week: number]: number } } = {};
  
  // Estimate goals based on average sales
  const totalSales = Object.values(salespeople).reduce((sum, person) => sum + person.totalAmount, 0);
  const avgSalesPerPerson = totalSales / (Object.keys(salespeople).length || 1);
  
  Object.values(salespeople).forEach(person => {
    // Initialize goals for this salesperson
    weeklyGoals[person.id] = {};
    
    // Calculate monthly goal (approximation)
    const monthlyGoal = Math.max(avgSalesPerPerson * 1.1, person.totalAmount * 1.1); // 10% more than current total
    
    // Calculate daily goal
    const dailyGoal = monthlyGoal / BUSINESS_DAYS_IN_MONTH;
    
    // Set weekly goal for each available week
    Array.from(weeksWithData).forEach(week => {
      weeklyGoals[person.id][week] = dailyGoal * WEEKLY_GOAL_MULTIPLIER;
    });
  });
  
  // Sort by total amount and add ranking
  const sortedSalespeople = Object.values(salespeople)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((person, index) => ({
      ...person,
      position: index + 1
    }));
  
  // Convert to array and sort available weeks
  const availableWeeks = Array.from(weeksWithData).sort((a, b) => a - b);
  
  return {
    weeklyData: sortedSalespeople,
    availableWeeks,
    currentWeek,
    weeklyTotals,
    weeklyGoals
  };
};
