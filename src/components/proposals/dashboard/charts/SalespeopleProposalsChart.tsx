
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { UserProposalStats } from '../types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';

interface SalespeopleProposalsChartProps {
  userProposalsData: UserProposalStats[];
}

export function SalespeopleProposalsChart({ userProposalsData }: SalespeopleProposalsChartProps) {
  const { user, originalUser } = useAuth();
  
  // Check if current user is admin or if original user is admin (for impersonation)
  const isAdmin = user?.role === UserRole.ADMIN || originalUser?.role === UserRole.ADMIN;

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
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Propostas por Vendedor
          {isAdmin && (
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
              Todos os vendedores
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userProposalsData.length > 0 ? (
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
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Nenhuma proposta encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}
