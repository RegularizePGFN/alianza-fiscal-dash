
import { parseISO } from 'date-fns';
import { Sale } from "@/lib/types";
import { SalespersonData, WeeklyDataResult } from "./types";
import { BUSINESS_DAYS_IN_MONTH, WEEKLY_GOAL_MULTIPLIER } from "./constants";
import { calculateBusinessDayWeeks } from "./weekCalculations";
import { getWeekNumberForDate } from "./dateUtils";

export const processWeeklyData = (salesData: Sale[]): WeeklyDataResult => {
  if (!salesData.length) return { 
    weeklyData: [], 
    availableWeeks: [], 
    currentWeek: 1,
    weeklyTotals: {},
    weeklyGoals: {},
    weekRanges: []
  };
  
  // Get the month and year from the first sale to determine which period we're processing
  const firstSaleDate = parseISO(salesData[0].sale_date);
  const currentMonth = firstSaleDate.getMonth() + 1;
  const currentYear = firstSaleDate.getFullYear();
  
  console.log(`Processing weekly data for ${currentMonth}/${currentYear}`);
  
  // Calculate week ranges based on business days for the specific month/year
  const weekRanges = calculateBusinessDayWeeks(currentYear, currentMonth);
  
  // Find current week using current date (only if processing current month)
  const now = new Date();
  const isCurrentMonth = now.getMonth() + 1 === currentMonth && now.getFullYear() === currentYear;
  const currentWeek = isCurrentMonth ? (getWeekNumberForDate(now, weekRanges) || 1) : 1;
  
  console.log(`Current week: ${currentWeek}`);
  
  // Initialize salesperson data map
  const salespeople: Record<string, SalespersonData> = {};
  
  // Initialize weekly totals
  const weeklyTotals: { [week: number]: { count: number; amount: number } } = {};
  
  // Process each sale into the weekly structure
  salesData.forEach(sale => {
    console.log(`Processing sale from ${sale.sale_date}`);
    
    // Parse sale date - it comes as a string in format YYYY-MM-DD
    const saleDate = parseISO(sale.sale_date);
    
    // Skip if not in the target month/year (safety check)
    if (saleDate.getMonth() !== currentMonth - 1 || saleDate.getFullYear() !== currentYear) {
      console.log(`Sale date ${sale.sale_date} is not in target month, skipping`);
      return;
    }
    
    // Find which week this sale belongs to using the sale_date string directly
    const saleWeek = getWeekNumberForDate(sale.sale_date, weekRanges);
    
    if (!saleWeek) {
      console.log(`Could not determine week for sale date ${sale.sale_date}`);
      return;
    }
    
    console.log(`Sale from ${sale.sale_date} belongs to week ${saleWeek}`);
    
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
  
  // Find all weeks that have data or exist in the week ranges
  const availableWeeks = weekRanges.map(range => range.weekNumber).sort((a, b) => a - b);
  console.log(`Available weeks: ${availableWeeks.join(', ')}`);
  
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
    availableWeeks.forEach(week => {
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
  
  console.log(`Final result: ${sortedSalespeople.length} salespeople, ${availableWeeks.length} weeks, current week: ${currentWeek}`);
  
  return {
    weeklyData: sortedSalespeople,
    availableWeeks,
    currentWeek,
    weeklyTotals,
    weeklyGoals,
    weekRanges
  };
};
