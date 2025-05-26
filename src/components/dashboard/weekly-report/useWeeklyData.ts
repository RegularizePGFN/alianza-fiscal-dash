
import { useMemo } from "react";
import { Sale } from "@/lib/types";

export function useWeeklyData(salesData: Sale[]) {
  const weeklyData = useMemo(() => {
    if (!salesData.length) return [];
    
    // Group sales by week
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Initialize weekly totals
    const weeklyTotals: Record<number, { week: number, sales: number, amount: number }> = {
      1: { week: 1, sales: 0, amount: 0 },
      2: { week: 2, sales: 0, amount: 0 },
      3: { week: 3, sales: 0, amount: 0 },
      4: { week: 4, sales: 0, amount: 0 },
      5: { week: 5, sales: 0, amount: 0 }, // Some months have parts of a 5th week
    };
    
    // Process sales data
    salesData.forEach(sale => {
      try {
        // Parse the sale date
        const saleDate = new Date(sale.sale_date);
        
        // Check if it's in the current month
        if (saleDate.getMonth() !== currentMonth || saleDate.getFullYear() !== currentYear) {
          return;
        }
        
        // Calculate week number (1-indexed)
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const dayOfWeekForFirst = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
        
        // Adjust day of week to make Monday the first day (0) and Sunday the last (6)
        const adjustedDayOfWeekForFirst = dayOfWeekForFirst === 0 ? 6 : dayOfWeekForFirst - 1;
        
        // Calculate the week number
        const dayOfMonth = saleDate.getDate();
        const week = Math.ceil((dayOfMonth + adjustedDayOfWeekForFirst) / 7);
        
        // Update totals
        if (weeklyTotals[week]) {
          weeklyTotals[week].sales += 1;
          weeklyTotals[week].amount += sale.gross_amount;
        }
      } catch (error) {
        console.error("Error processing sale date:", error, sale);
      }
    });
    
    // Convert to array and sort by week
    return Object.values(weeklyTotals)
      .filter(week => week.week <= 5) // Limit to 5 weeks max
      .map(week => ({
        name: `Semana ${week.week}`,
        Vendas: week.sales,
        Valor: week.amount,
        week: week.week,
      }))
      .sort((a, b) => a.week - b.week);
  }, [salesData]);

  const currentWeek = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfWeekForFirst = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Adjust day of week to make Monday the first day (0) and Sunday the last (6)
    const adjustedDayOfWeekForFirst = dayOfWeekForFirst === 0 ? 6 : dayOfWeekForFirst - 1;
    
    // Calculate the week number
    const dayOfMonth = now.getDate();
    return Math.ceil((dayOfMonth + adjustedDayOfWeekForFirst) / 7);
  }, []);

  return { weeklyData, currentWeek };
}
