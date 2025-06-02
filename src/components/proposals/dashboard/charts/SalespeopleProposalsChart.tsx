
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProposalStats {
  name: string;
  count: number;
  fees: number;
  color: string;
}

interface SalespeopleProposalsChartProps {
  userProposalsData: UserProposalStats[];
}

export function SalespeopleProposalsChart({ userProposalsData }: SalespeopleProposalsChartProps) {
  if (!userProposalsData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Propostas por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">
            Propostas: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-green-600">
            Honorários: <span className="font-semibold">R$ {data.fees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate max-w-[80px]" title={entry.value}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propostas por Vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={userProposalsData}
                cx="50%"
                cy="45%"
                outerRadius={80}
                dataKey="count"
                nameKey="name"
              >
                {userProposalsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary below chart */}
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm">Resumo:</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {userProposalsData.slice(0, 3).map((user, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium truncate max-w-[100px]" title={user.name}>
                  {user.name}
                </span>
                <div className="text-right">
                  <div>{user.count} propostas</div>
                  <div className="text-green-600">
                    R$ {user.fees.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
