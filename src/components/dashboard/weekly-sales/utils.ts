
import { Sale } from "@/lib/types";
import { SalespersonData, WeeklyDataResult, WeekRange } from "./types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export const getGoalStatusTextColor = (
  personId: string, 
  week: number, 
  amount: number, 
  weeklyGoals: WeeklyDataResult["weeklyGoals"]
) => {
  if (!weeklyGoals[personId] || !weeklyGoals[personId][week]) return "";
  
  const goal = weeklyGoals[personId][week];
  
  if (amount >= goal) {
    return "text-green-600 dark:text-green-500 font-medium"; // Green text for goal achieved
  } else {
    return "text-red-600 dark:text-red-500 font-medium"; // Red text for goal not achieved
  }
};

// Calculate business day weeks for the current month
export const calculateBusinessDayWeeks = (year: number, month: number): WeekRange[] => {
  console.log(`Calculating business day weeks for ${month}/${year}`);
  
  // Get all days in the month
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  // Get all business days in the month
  const businessDays: Date[] = [];
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Only include Monday (1) to Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      businessDays.push(currentDate);
    }
  }
  
  console.log(`Found ${businessDays.length} business days in ${month}/${year}`);
  
  // Group business days into weeks (5 days each, except possibly the last week)
  const weekRanges: WeekRange[] = [];
  let weekNumber = 1;
  
  for (let i = 0; i < businessDays.length; i += 5) {
    const weekStart = businessDays[i];
    const weekEnd = businessDays[Math.min(i + 4, businessDays.length - 1)];
    
    weekRanges.push({
      weekNumber,
      startDate: new Date(weekStart),
      endDate: new Date(weekEnd)
    });
    
    console.log(`Week ${weekNumber}: ${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM', { locale: ptBR })}`);
    weekNumber++;
  }
  
  console.log(`Created ${weekRanges.length} week ranges`);
  return weekRanges;
};

// Calculate which week a given date belongs to
export const getWeekNumberForDate = (date: Date, weekRanges: WeekRange[]): number | null => {
  const dateTime = date.getTime();
  
  for (const range of weekRanges) {
    const startTime = range.startDate.getTime();
    const endTime = range.endDate.getTime() + (24 * 60 * 60 * 1000 - 1); // End of day
    
    if (dateTime >= startTime && dateTime <= endTime) {
      return range.weekNumber;
    }
  }
  
  return null;
};

// Calculate week date ranges for the current month
export const calculateWeekDateRanges = (): WeekRange[] => {
  const now = new Date();
  return calculateBusinessDayWeeks(now.getFullYear(), now.getMonth() + 1);
};

// Format date range as "d-d MMM" (e.g., "1-5 mai")
export const formatWeekRange = (range: WeekRange): string => {
  const startDay = format(range.startDate, 'd', { locale: ptBR });
  const endDay = format(range.endDate, 'd', { locale: ptBR });
  const month = format(range.endDate, 'MMM', { locale: ptBR });
  
  return `${startDay}-${endDay} ${month}`;
};

export const processWeeklyData = (salesData: Sale[]): WeeklyDataResult => {
  if (!salesData.length) return { 
    weeklyData: [], 
    availableWeeks: [], 
    currentWeek: 1,
    weeklyTotals: {},
    weeklyGoals: {},
    weekRanges: []
  };
  
  // Get current date info
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();
  
  console.log(`Processing weekly data for ${currentMonth}/${currentYear}`);
  
  // Calculate week ranges based on business days
  const weekRanges = calculateBusinessDayWeeks(currentYear, currentMonth);
  
  // Find current week
  const currentWeek = getWeekNumberForDate(now, weekRanges) || 1;
  console.log(`Current week: ${currentWeek}`);
  
  // Initialize salesperson data map
  const salespeople: Record<string, SalespersonData> = {};
  
  // Initialize weekly totals
  const weeklyTotals: { [week: number]: { count: number; amount: number } } = {};
  
  // Process each sale into the weekly structure
  salesData.forEach(sale => {
    const saleDate = new Date(sale.sale_date);
    console.log(`Processing sale from ${sale.sale_date} (${format(saleDate, 'dd/MM/yyyy')})`);
    
    // Skip if not in the current month/year
    if (saleDate.getMonth() !== currentMonth - 1 || saleDate.getFullYear() !== currentYear) {
      console.log(`Sale date ${sale.sale_date} is not in current month, skipping`);
      return;
    }
    
    // Find which week this sale belongs to
    const saleWeek = getWeekNumberForDate(saleDate, weekRanges);
    
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
