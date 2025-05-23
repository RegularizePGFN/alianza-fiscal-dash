
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyProposalCount, SummaryStats } from '../types';
import { formatCurrency } from '@/lib/utils';

interface MonthlyProposalsChartProps {
  dailyProposalsData: DailyProposalCount[];
  summaryStats: SummaryStats;
}

export function MonthlyProposalsChart({ dailyProposalsData, summaryStats }: MonthlyProposalsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
          <p className="text-xs font-medium">{`Data: ${label}`}</p>
          <p className="text-xs text-purple-600">{`Propostas: ${payload[0].value}`}</p>
          {payload[1] && (
            <p className="text-xs text-green-600">{`Honorários: ${formatCurrency(payload[1].value)}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Propostas do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total: <span className="font-medium">{summaryStats.total}</span></p>
            <p className="text-sm text-green-600">Honorários: <span className="font-medium">{formatCurrency(summaryStats.totalFees)}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Média por proposta:</p>
            <p className="text-sm text-green-600 font-medium">{formatCurrency(summaryStats.averageFees)}</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyProposalsData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 10 }}
                tickMargin={10}
              />
              <YAxis yAxisId="left" tickFormatter={value => value} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={value => `R$${(value/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="Propostas"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fees"
                name="Honorários"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
