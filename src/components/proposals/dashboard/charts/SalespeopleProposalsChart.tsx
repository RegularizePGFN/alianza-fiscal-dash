
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProposalStats } from '../types';
import { formatCurrency } from '@/lib/utils';

interface SalespeopleProposalsChartProps {
  userProposalsData: UserProposalStats[];
}

export function SalespeopleProposalsChart({ userProposalsData }: SalespeopleProposalsChartProps) {
  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
          <p className="text-xs font-medium">{`${payload[0].name}`}</p>
          <p className="text-xs">{`Propostas: ${payload[0].value}`}</p>
          <p className="text-xs text-green-600">{`Honorários: ${formatCurrency(payload[0].payload.fees)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Propostas por Vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userProposalsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {userProposalsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieCustomTooltip />} />
              <Legend 
                formatter={(value, entry, index) => <span className="text-xs">{value}</span>} 
                layout="vertical" 
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
