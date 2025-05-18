
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DailyPerformance } from "./types";

interface PerformanceCardsProps {
  performance: DailyPerformance;
}

export function PerformanceCards({ performance }: PerformanceCardsProps) {
  const { totalSales, totalAmount, averageTicket, proposalsCount = 0, feesAmount = 0 } = performance;
  
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Total de Vendas</p>
            <p className="text-2xl font-bold">{totalSales}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Total de Honorários</p>
            <p className="text-2xl font-bold">{formatCurrency(feesAmount)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
