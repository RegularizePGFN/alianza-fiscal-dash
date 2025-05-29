
import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import { 
  ProposalData, 
  UserData, 
  DailyProposalCount, 
  UserProposalStats, 
  SummaryStats 
} from '../types';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#af19ff', '#00C49F', '#FFBB28', '#FF8042'];

export function useDashboardData() {
  const [proposalsData, setProposalsData] = useState<ProposalData[]>([]);
  const [usersData, setUsersData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user, originalUser } = useAuth();
  
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
        
        // Check if current user is admin or if original user is admin (for impersonation)
        const isAdmin = user.role === UserRole.ADMIN || originalUser?.role === UserRole.ADMIN;
        
        // Query based on user role - admins see all proposals
        let query = supabase
          .from('proposals')
          .select('id, user_id, created_at, total_debt, discounted_value, fees_value')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        // Only filter by user_id if not an admin
        if (!isAdmin) {
          query = query.eq('user_id', user.id);
        }
        
        const { data: proposals, error: proposalsError } = await query;
        
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
  }, [user, originalUser]);
  
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
  
  return { 
    dailyProposalsData,
    userProposalsData,
    summaryStats,
    isLoading
  };
}
