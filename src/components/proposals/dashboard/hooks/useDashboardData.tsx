
import { useState, useEffect, useMemo } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { 
  ProposalData, 
  UserData, 
  DailyProposalCount, 
  UserProposalStats, 
  SummaryStats 
} from '../types';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#af19ff', '#00C49F', '#FFBB28', '#FF8042'];

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export function useDashboardData() {
  const [proposalsData, setProposalsData] = useState<ProposalData[]>([]);
  const [usersData, setUsersData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return { from: monthStart, to: monthEnd };
  });
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !dateRange.from || !dateRange.to) return;
      
      setIsLoading(true);
      try {
        // Format for database query
        const startDate = dateRange.from.toISOString();
        const endDate = dateRange.to.toISOString();
        
        // Fetch proposals for the selected date range
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
  }, [user, dateRange]);
  
  // Daily proposals count for the selected date range
  const dailyProposalsData = useMemo(() => {
    if (!proposalsData.length || !dateRange.from || !dateRange.to) return [];
    
    // Create array of dates for the selected range
    const daysInRange = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });
    
    // Initialize counts for each day
    const dailyCounts: Record<string, DailyProposalCount> = {};
    
    daysInRange.forEach(day => {
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
  }, [proposalsData, dateRange]);
  
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
  
  return { 
    dailyProposalsData,
    userProposalsData,
    summaryStats,
    isLoading,
    dateRange,
    setDateRange
  };
}
