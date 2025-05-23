
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SalespersonWeeklyCardProps {
  salesData: Sale[];
  isLoading?: boolean;
}

export function SalespersonWeeklyCard({ salesData, isLoading = false }: SalespersonWeeklyCardProps) {
  // State for selected week
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');
  const [showChartView, setShowChartView] = useState(true);

  // Process weekly data
  const weeksData = useMemo(() => {
    if (!salesData.length) return { weeklyData: new Map<number, any[]>(), availableWeeks: [] };
    
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
    
    // Map to store sales by week and salesperson
    const weekSalesMap = new Map<number, Map<string, { name: string; amount: number; count: number }>>();
    
    // Initialize map for each possible week in month (max 6 weeks)
    for (let week = 1; week <= 6; week++) {
      weekSalesMap.set(week, new Map());
    }
    
    // Process sales data
    salesData.forEach(sale => {
      const saleDate = new Date(sale.sale_date);
      if (saleDate.getMonth() !== currentMonth || saleDate.getFullYear() !== currentYear) {
        return;
      }
      
      const saleDayOfMonth = saleDate.getDate();
      const saleWeek = Math.ceil((saleDayOfMonth + adjustedDayOfWeekForFirst) / 7);
      
      const weekMap = weekSalesMap.get(saleWeek);
      if (!weekMap) return;
      
      const id = sale.salesperson_id;
      const name = sale.salesperson_name || "Desconhecido";
      
      if (!weekMap.has(id)) {
        weekMap.set(id, { name, amount: 0, count: 0 });
      }
      
      const record = weekMap.get(id)!;
      record.amount += sale.gross_amount;
      record.count += 1;
    });
    
    // Get list of weeks that have data
    const availableWeeks = Array.from(weekSalesMap.entries())
      .filter(([_, salesMap]) => salesMap.size > 0)
      .map(([week]) => week)
      .sort((a, b) => a - b);
    
    // Convert map to array format for each week
    const weeklyData = new Map<number, any[]>();
    
    weekSalesMap.forEach((salesMap, week) => {
      if (salesMap.size === 0) return;
      
      const weekData = Array.from(salesMap.values())
        .sort((a, b) => b.amount - a.amount)
        .map((data, index) => ({
          ...data,
          position: index + 1,
          initials: data.name.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        }));
      
      weeklyData.set(week, weekData);
    });
    
    return { weeklyData, availableWeeks, currentWeek };
  }, [salesData]);
  
  // Get data for the selected week
  const currentWeekData = useMemo(() => {
    if (selectedWeek === 'all') {
      // Combine data from all weeks
      const allData = new Map<string, { name: string; amount: number; count: number }>();
      
      // Ensure weeklyData is treated as a Map
      if (weeksData.weeklyData instanceof Map) {
        weeksData.weeklyData.forEach((weekData, week) => {
          weekData.forEach(person => {
            const key = person.name;
            if (!allData.has(key)) {
              allData.set(key, { name: person.name, amount: 0, count: 0 });
            }
            const record = allData.get(key)!;
            record.amount += person.amount;
            record.count += person.count;
          });
        });
      }
      
      return Array.from(allData.values())
        .sort((a, b) => b.amount - a.amount)
        .map((data, index) => ({
          ...data,
          position: index + 1,
          initials: data.name.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        }));
    }
    
    // Ensure weeklyData is treated as a Map and handle the case when it's not
    return (weeksData.weeklyData instanceof Map && weeksData.weeklyData.get(selectedWeek as number)) || [];
  }, [weeksData, selectedWeek]);
  
  // Chart data
  const chartData = useMemo(() => {
    return currentWeekData.map(person => ({
      name: person.name,
      valor: person.amount
    }));
  }, [currentWeekData]);

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

  const getColor = (position: number) => {
    switch (position) {
      case 1: return "bg-amber-500 dark:bg-amber-600";
      case 2: return "bg-slate-400 dark:bg-slate-500";
      case 3: return "bg-amber-700 dark:bg-amber-800";
      default: return "bg-slate-200 dark:bg-slate-700";
    }
  };

  // Generate week options for select
  const weekOptions = [
    { value: 'all', label: 'Todas as Semanas' },
    ...weeksData.availableWeeks.map(week => ({ 
      value: week.toString(), 
      label: `Semana ${week}${week === weeksData.currentWeek ? ' (atual)' : ''}` 
    }))
  ];

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <CardTitle>Desempenho Semanal</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="chart-view" 
                checked={showChartView}
                onCheckedChange={checked => setShowChartView(!!checked)}
              />
              <Label htmlFor="chart-view">Gráfico</Label>
            </div>
            <Select
              value={selectedWeek.toString()}
              onValueChange={(value) => setSelectedWeek(value === 'all' ? 'all' : parseInt(value))}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Selecione a semana" />
              </SelectTrigger>
              <SelectContent>
                {weekOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedWeek === 'all' ? 'Dados consolidados de todas as semanas do mês atual' : 
           `Dados da ${weekOptions.find(w => w.value === selectedWeek.toString())?.label || 'Semana'}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showChartView && currentWeekData.length > 0 && (
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 0 }}
                  />
                  <Bar 
                    dataKey="valor" 
                    radius={[4, 4, 0, 0]} 
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWeekData.length > 0 ? (
                currentWeekData.map((person) => (
                  <TableRow key={person.name}>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Não há dados para exibir {selectedWeek === 'all' ? 'neste mês' : 'nesta semana'}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
