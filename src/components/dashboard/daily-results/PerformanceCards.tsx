
import React from 'react';
import { DailyPerformance } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, TrendingUp, DollarSign, FileText } from 'lucide-react';

interface PerformanceCardsProps {
  performance: DailyPerformance;
}

export function PerformanceCards({ performance }: PerformanceCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="flex flex-col p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Vendas</span>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{performance.totalSales}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Ticket Médio</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(performance.averageTicket)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Total</span>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(performance.totalAmount)}</p>
        </CardContent>
      </Card>

      {performance.proposalsCount !== undefined && (
        <Card>
          <CardContent className="flex flex-col p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Propostas</span>
              <FileText className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{performance.proposalsCount}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
