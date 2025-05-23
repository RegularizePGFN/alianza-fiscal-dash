
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { Sale } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SalespersonWeeklyCardProps {
  salesData: Sale[];
  isLoading?: boolean;
}

export function SalespersonWeeklyCard({ salesData, isLoading = false }: SalespersonWeeklyCardProps) {
  const currentWeekData = useMemo(() => {
    if (!salesData.length) return [];
    
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
    
    // Filter current week sales
    const currentWeekSales = salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      if (saleDate.getMonth() !== currentMonth || saleDate.getFullYear() !== currentYear) {
        return false;
      }
      
      const saleDayOfMonth = saleDate.getDate();
      const saleWeek = Math.ceil((saleDayOfMonth + adjustedDayOfWeekForFirst) / 7);
      
      return saleWeek === currentWeek;
    });
    
    // Group by salesperson
    const salespersonMap = new Map<string, { name: string; amount: number; count: number }>();
    
    currentWeekSales.forEach(sale => {
      const id = sale.salesperson_id;
      const name = sale.salesperson_name || "Desconhecido";
      
      if (!salespersonMap.has(id)) {
        salespersonMap.set(id, { name, amount: 0, count: 0 });
      }
      
      const record = salespersonMap.get(id)!;
      record.amount += sale.gross_amount;
      record.count += 1;
    });
    
    return Array.from(salespersonMap.values())
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
  }, [salesData]);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Desempenho Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                    Não há dados para exibir nesta semana.
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
