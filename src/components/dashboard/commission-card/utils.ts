
import { Sale } from "@/lib/types";
import { format, isWeekend, eachDayOfInterval, isSameMonth, startOfMonth, endOfMonth, isAfter } from 'date-fns';

export interface DailyDataPoint {
  day: string;
  value: number;
  count: number;
  date: string;
  formattedDate: string;
}

export function generateDailyData(salesData: Sale[], userId: string | undefined): DailyDataPoint[] {
  if (!userId) return [];
  
  const now = new Date();
  
  // Generate interval of days from first day of month until today
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const today = new Date();
  
  // Get all days of the month until today (don't include future days)
  const allDaysInterval = eachDayOfInterval({ 
    start: monthStart, 
    end: isAfter(today, monthEnd) ? monthEnd : today 
  });
  
  // Filter only business days (exclude weekends)
  const businessDays = allDaysInterval.filter(day => !isWeekend(day));
  
  // Create object with business days initialized with zero value
  const businessDaysMap: Record<string, DailyDataPoint> = {};
  
  businessDays.forEach(day => {
    const isoDate = format(day, 'yyyy-MM-dd');
    const dayNumber = format(day, 'dd');
    const formattedDate = format(day, 'dd/MM');
    
    businessDaysMap[isoDate] = {
      day: dayNumber,
      value: 0,
      count: 0,
      date: isoDate,
      formattedDate: formattedDate
    };
  });
  
  // Filter sales for the current month and user
  const filteredSales = salesData.filter(sale => {
    if (sale.salesperson_id !== userId) return false;
    
    if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const saleDate = new Date(sale.sale_date);
      return isSameMonth(saleDate, now);
    }
    return false;
  });
  
  // Fill the days that have sales with the correct values
  filteredSales.forEach(sale => {
    if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const saleDate = sale.sale_date;
      
      // Check if the sale date is in the business days map
      if (businessDaysMap[saleDate]) {
        businessDaysMap[saleDate].value += sale.gross_amount;
        businessDaysMap[saleDate].count += 1;
      }
    }
  });
  
  // Convert to array and sort by date
  return Object.values(businessDaysMap).sort((a, b) => 
    a.date.localeCompare(b.date)
  );
}

export function calculateTotals(dailyData: DailyDataPoint[]) {
  const totalDailySales = dailyData.reduce((sum, item) => sum + item.value, 0);
  const totalCount = dailyData.reduce((sum, item) => sum + item.count, 0);
  const daysWithSales = dailyData.filter(day => day.count > 0).length;
  const totalDays = dailyData.length;
  
  const averageSalesAmount = totalCount > 0 ? totalDailySales / totalCount : 0;
  const averageContractsPerDay = daysWithSales > 0 ? totalCount / daysWithSales : 0;
  
  return {
    totalDailySales,
    totalCount,
    averageSalesAmount,
    averageContractsPerDay,
    daysWithSales,
    totalBusinessDays: totalDays
  };
}
