
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SalespersonWeeklyCardProps {
  salesData: Sale[];
  isLoading?: boolean;
}

interface SalespersonData {
  id: string;
  name: string;
  initials: string;
  weeklyStats: {
    [week: number]: {
      count: number;
      amount: number;
    };
  };
  totalCount: number;
  totalAmount: number;
}

// Define the return type for the useMemo function
interface WeeklyDataResult {
  weeklyData: Array<SalespersonData & { position: number }>;
  availableWeeks: number[];
  currentWeek: number;
  weeklyTotals: {
    [week: number]: {
      count: number;
      amount: number;
    };
  };
  weeklyGoals: {
    [id: string]: {
      [week: number]: number;
    };
  };
}

// Helper constants for goal calculations
const BUSINESS_DAYS_IN_MONTH = 22; // Average number of business days in a month
const WEEKLY_GOAL_MULTIPLIER = 5; // Number of business days in a week

export function SalespersonWeeklyCard({ salesData, isLoading = false }: SalespersonWeeklyCardProps) {
  // Process weekly data
  const { weeklyData, availableWeeks, currentWeek, weeklyTotals, weeklyGoals } = useMemo<WeeklyDataResult>(() => {
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
  }, [salesData]);

  const getColor = (position: number) => {
    switch (position) {
      case 1: return "bg-amber-500 dark:bg-amber-600";
      case 2: return "bg-slate-400 dark:bg-slate-500";
      case 3: return "bg-amber-700 dark:bg-amber-800";
      default: return "bg-slate-200 dark:bg-slate-700";
    }
  };
  
  const getGoalStatusColor = (personId: string, week: number, amount: number) => {
    if (!weeklyGoals[personId] || !weeklyGoals[personId][week]) return "";
    
    const goal = weeklyGoals[personId][week];
    
    if (amount >= goal) {
      return "bg-green-100 dark:bg-green-900/20"; // Light green for goal achieved
    } else {
      return "bg-red-100 dark:bg-red-900/20"; // Light red for goal not achieved
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Desempenho Semanal</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p>Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  // No data scenario
  if (!availableWeeks || availableWeeks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Desempenho Semanal</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">Não há dados de vendas para exibir neste mês.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Desempenho Semanal</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead rowSpan={2} className="w-12 align-bottom">#</TableHead>
              <TableHead rowSpan={2} className="align-bottom">Vendedor</TableHead>
              
              {availableWeeks.map((week) => (
                <React.Fragment key={`week-${week}`}>
                  <TableHead colSpan={2} className="text-center border-l">
                    Semana {week} {week === currentWeek ? '(atual)' : ''}
                  </TableHead>
                </React.Fragment>
              ))}
              
              <TableHead colSpan={2} className="text-center border-l bg-muted/30">
                Total
              </TableHead>
            </TableRow>
            
            <TableRow>
              {availableWeeks.map((week) => (
                <React.Fragment key={`week-headers-${week}`}>
                  <TableHead className="text-center border-l">Vendas</TableHead>
                  <TableHead className="text-center">Valor</TableHead>
                </React.Fragment>
              ))}
              <TableHead className="text-center border-l bg-muted/30">Vendas</TableHead>
              <TableHead className="text-center bg-muted/30">Valor</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {weeklyData.length > 0 && weeklyData.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs text-white ${getColor(person.position)}`}>
                    {person.position}
                  </span>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-7 w-7 mr-2">
                      <AvatarFallback className="text-xs">
                        {person.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{person.name}</span>
                  </div>
                </TableCell>
                
                {availableWeeks.map((week) => {
                  const weekStats = person.weeklyStats[week] || { count: 0, amount: 0 };
                  return (
                    <React.Fragment key={`${person.id}-week-${week}`}>
                      <TableCell 
                        className={`text-center border-l ${getGoalStatusColor(person.id, week, weekStats.amount)}`}
                      >
                        {weekStats.count}
                      </TableCell>
                      <TableCell 
                        className={`text-right ${getGoalStatusColor(person.id, week, weekStats.amount)}`}
                      >
                        {formatCurrency(weekStats.amount)}
                      </TableCell>
                    </React.Fragment>
                  );
                })}
                
                <TableCell className="text-center border-l font-medium bg-muted/30">
                  {person.totalCount}
                </TableCell>
                <TableCell className="text-right font-medium bg-muted/30">
                  {formatCurrency(person.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
            
            {/* Weekly Totals Row */}
            <TableRow className="border-t-2 border-t-gray-300 dark:border-t-gray-600">
              <TableCell colSpan={2} className="font-bold">
                Total por Semana
              </TableCell>
              
              {availableWeeks.map((week) => {
                const weekTotal = weeklyTotals[week] || { count: 0, amount: 0 };
                return (
                  <React.Fragment key={`total-week-${week}`}>
                    <TableCell className="text-center border-l font-bold">
                      {weekTotal.count}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(weekTotal.amount)}
                    </TableCell>
                  </React.Fragment>
                );
              })}
              
              {/* Grand Totals */}
              <TableCell className="text-center border-l font-bold bg-muted/30">
                {Object.values(weeklyTotals).reduce((sum, week) => sum + week.count, 0)}
              </TableCell>
              <TableCell className="text-right font-bold bg-muted/30">
                {formatCurrency(Object.values(weeklyTotals).reduce((sum, week) => sum + week.amount, 0))}
              </TableCell>
            </TableRow>
            
            {weeklyData.length === 0 && (
              <TableRow>
                <TableCell colSpan={2 + (availableWeeks.length * 2) + 2} className="text-center py-6">
                  Não há dados de vendas para exibir neste mês.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
