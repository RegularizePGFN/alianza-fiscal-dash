
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SalespersonWeeklyCardProps {
  salesData: Sale[];
  isLoading?: boolean;
}

export function SalespersonWeeklyCard({ salesData, isLoading = false }: SalespersonWeeklyCardProps) {
  // Process weekly data
  const weeksData = useMemo(() => {
    if (!salesData.length) return {};
    
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
    
    // Process sales data by week and salesperson
    const weekData = {};
    const maxWeeks = 6; // Support up to 6 weeks in a month
    
    // Initialize week data structure
    for (let week = 1; week <= maxWeeks; week++) {
      weekData[week] = {
        hasData: false,
        salespeople: {}
      };
    }
    
    // Process each sale into the weekly structure
    salesData.forEach(sale => {
      const saleDate = new Date(sale.sale_date);
      
      // Skip if not in the current month/year
      if (saleDate.getMonth() !== currentMonth || saleDate.getFullYear() !== currentYear) {
        return;
      }
      
      const saleDayOfMonth = saleDate.getDate();
      const saleWeek = Math.ceil((saleDayOfMonth + adjustedDayOfWeekForFirst) / 7);
      
      if (saleWeek > maxWeeks) return; // Skip if it's beyond our tracking
      
      const id = sale.salesperson_id;
      const name = sale.salesperson_name || "Desconhecido";
      
      // Initialize salesperson record if not exists
      if (!weekData[saleWeek].salespeople[id]) {
        weekData[saleWeek].salespeople[id] = {
          id,
          name,
          amount: 0,
          count: 0,
          initials: name.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        };
      }
      
      // Update sale data
      weekData[saleWeek].salespeople[id].amount += sale.gross_amount;
      weekData[saleWeek].salespeople[id].count += 1;
      weekData[saleWeek].hasData = true;
    });
    
    // Format the data for each week - sort by amount and add ranking
    const formattedWeekData = {};
    const availableWeeks = [];
    
    for (let week = 1; week <= maxWeeks; week++) {
      if (weekData[week].hasData) {
        availableWeeks.push(week);
        
        // Convert to array and sort by amount
        formattedWeekData[week] = Object.values(weekData[week].salespeople)
          .sort((a, b) => b.amount - a.amount)
          .map((person, index) => ({
            ...person,
            position: index + 1
          }));
      }
    }
    
    return {
      formattedWeekData,
      availableWeeks,
      currentWeek
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
  if (!weeksData.availableWeeks || weeksData.availableWeeks.length === 0) {
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
      <CardContent>
        <Tabs defaultValue={weeksData.currentWeek?.toString() || weeksData.availableWeeks[0].toString()}>
          <TabsList className="w-full mb-4">
            {weeksData.availableWeeks.map((week) => (
              <TabsTrigger 
                key={`week-${week}`} 
                value={week.toString()} 
                className="flex-1"
              >
                Semana {week}{week === weeksData.currentWeek ? ' (atual)' : ''}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {weeksData.availableWeeks.map((week) => (
            <TabsContent key={`week-content-${week}`} value={week.toString()}>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Vendas</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeksData.formattedWeekData[week].map((person) => (
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
                      <TableCell className="text-right">{person.count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(person.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
