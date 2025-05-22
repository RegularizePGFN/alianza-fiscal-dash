
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { formatCurrency } from '@/lib/utils';

interface ProposalData {
  id: string;
  user_id: string;
  created_at: string;
  total_debt: number;
  discounted_value: number;
  fees_value: number;
}

interface UserData {
  id: string;
  name: string;
}

interface DailyProposalCount {
  date: string;
  formattedDate: string;
  count: number;
  fees: number;
}

interface UserProposalStats {
  name: string;
  count: number;
  fees: number;
  color: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#af19ff', '#00C49F', '#FFBB28', '#FF8042'];

export function ProposalsDashboard() {
  const [proposalsData, setProposalsData] = useState<ProposalData[]>([]);
  const [usersData, setUsersData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get current month date range
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        
        // Format for database query
        const startDate = monthStart.toISOString();
        const endDate = monthEnd.toISOString();
        
        // Fetch proposals for the current month
        const { data: proposals, error: proposalsError } = await supabase
          .from('proposals')
          .select('id, user_id, created_at, total_debt, discounted_value, fees_value')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        if (proposalsError) {
          console.error('Error fetching proposals:', proposalsError);
          return;
        }
        
        // Fetch users data for mapping
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, name');
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
          return;
        }
        
        // Create a mapping of user IDs to names
        const userMap = (users || []).reduce((acc, user) => {
          acc[user.id] = user.name;
          return acc;
        }, {} as Record<string, string>);
        
        setProposalsData(proposals || []);
        setUsersData(userMap);
      } catch (error) {
        console.error('Error processing dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Daily proposals count for the current month
  const dailyProposalsData = useMemo(() => {
    if (!proposalsData.length) return [];
    
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Create array of dates for the month
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: now // Only count up to today
    });
    
    // Initialize counts for each day
    const dailyCounts: Record<string, DailyProposalCount> = {};
    
    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const formattedDate = format(day, 'dd/MM');
      
      dailyCounts[dateStr] = {
        date: dateStr,
        formattedDate: formattedDate,
        count: 0,
        fees: 0
      };
    });
    
    // Count proposals for each day
    proposalsData.forEach(proposal => {
      const dateStr = proposal.created_at.split('T')[0];
      if (dailyCounts[dateStr]) {
        dailyCounts[dateStr].count += 1;
        dailyCounts[dateStr].fees += proposal.fees_value || 0;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(dailyCounts).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  }, [proposalsData]);
  
  // User proposals statistics
  const userProposalsData = useMemo(() => {
    if (!proposalsData.length || !Object.keys(usersData).length) return [];
    
    // Count proposals per user
    const userCounts: Record<string, { count: number, fees: number }> = {};
    
    proposalsData.forEach(proposal => {
      if (!userCounts[proposal.user_id]) {
        userCounts[proposal.user_id] = { count: 0, fees: 0 };
      }
      userCounts[proposal.user_id].count += 1;
      userCounts[proposal.user_id].fees += proposal.fees_value || 0;
    });
    
    // Convert to array with user names
    return Object.entries(userCounts).map(([userId, stats], index) => ({
      name: usersData[userId] || 'Unknown',
      count: stats.count,
      fees: stats.fees,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.count - a.count);
  }, [proposalsData, usersData]);
  
  // Summary statistics
  const summaryStats = useMemo(() => {
    if (!proposalsData.length) return { total: 0, totalFees: 0, averageFees: 0 };
    
    const total = proposalsData.length;
    const totalFees = proposalsData.reduce((sum, proposal) => sum + (proposal.fees_value || 0), 0);
    const averageFees = totalFees / total;
    
    return { total, totalFees, averageFees };
  }, [proposalsData]);
  
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
  
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Dashboard de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
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
                <Legend formatter={(value, entry, index) => 
                  <span className="text-xs">{value}</span>} 
                  layout="vertical" 
                  verticalAlign="middle"
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
