
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
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        console.log("=== DASHBOARD DATA DEBUG ===");
        console.log("Dashboard - Current user:", user.name, "Role:", user.role, "Email:", user.email);
        
        const isAdmin = user.role === UserRole.ADMIN;
        console.log("Dashboard - Is admin:", isAdmin);
        
        // Simplified query focusing only on essential fields
        let query = supabase
          .from('proposals')
          .select('id, user_id, created_at, fees_value')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(500); // Reasonable limit for performance
        
        if (!isAdmin) {
          console.log("Dashboard - Regular user, showing own proposals only");
          query = query.eq('user_id', user.id);
        }
        
        const { data: proposals, error: proposalsError } = await query;
        
        console.log("Dashboard - Proposals query result:", { count: proposals?.length || 0, error: proposalsError });
        
        if (proposalsError) {
          console.error('Dashboard - Error fetching proposals:', proposalsError);
          return;
        }
        
        if (!proposals || proposals.length === 0) {
          console.log("Dashboard - No proposals found");
          setProposalsData([]);
          setUsersData({});
          return;
        }
        
        // Get unique user IDs from proposals
        const uniqueUserIds = [...new Set(proposals.map(p => p.user_id))];
        console.log("Dashboard - Unique user IDs from proposals:", uniqueUserIds.length);
        
        if (uniqueUserIds.length === 0) {
          console.log("Dashboard - No user IDs found in proposals");
          setProposalsData([]);
          setUsersData({});
          return;
        }
        
        // Fetch users based on the user_ids from proposals
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, role')
          .in('id', uniqueUserIds);
        
        if (usersError) {
          console.error('Dashboard - Error fetching users:', usersError);
          // Continue without user names rather than failing completely
        }
        
        console.log("Dashboard - Users data fetched:", users?.length || 0);
        
        // For admins, filter proposals to show only from vendedor users
        let finalProposals = proposals;
        if (isAdmin && users) {
          const vendorUserIds = users
            .filter(user => user.role === 'vendedor')
            .map(user => user.id);
          
          console.log("Dashboard - Vendor user IDs:", vendorUserIds.length);
          
          if (vendorUserIds.length > 0) {
            finalProposals = proposals.filter(proposal => 
              vendorUserIds.includes(proposal.user_id)
            );
            console.log("Dashboard - Filtered proposals for vendors:", finalProposals.length);
          } else {
            console.log("Dashboard - No vendor users found, showing empty result");
            finalProposals = [];
          }
        }
        
        // Create a mapping of user IDs to names
        const userMap = (users || []).reduce((acc, user) => {
          acc[user.id] = user.name;
          return acc;
        }, {} as Record<string, string>);
        
        console.log('Dashboard - User mapping created:', Object.keys(userMap).length, 'users');
        
        // Convert to ProposalData format
        const formattedProposals = finalProposals.map(proposal => ({
          id: proposal.id,
          user_id: proposal.user_id,
          created_at: proposal.created_at,
          fees_value: parseFloat(proposal.fees_value?.toString() || '0')
        }));
        
        setProposalsData(formattedProposals);
        setUsersData(userMap);
        
        console.log("Dashboard - Final data set:", {
          proposalsCount: formattedProposals.length,
          usersCount: Object.keys(userMap).length,
        });
      } catch (error) {
        console.error('Dashboard - Error processing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, user?.role]); // Only depend on essential user properties
  
  // Daily proposals count for the current month
  const dailyProposalsData = useMemo(() => {
    console.log("=== DAILY PROPOSALS CALCULATION ===");
    console.log("Proposals data for daily calc:", proposalsData.length);
    
    if (!proposalsData.length) return [];
    
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Create array of dates for the month
    const daysInMonth = eachDayOfInterval({
      start: monthStart,
      end: now // Only count up to today
    });
    
    console.log("Days in month to calculate:", daysInMonth.length);
    
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
    
    const result = Object.values(dailyCounts).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
    
    console.log("Daily proposals result sample:", result.slice(0, 3));
    console.log("Total daily proposals:", result.reduce((sum, day) => sum + day.count, 0));
    return result;
  }, [proposalsData]);
  
  // User proposals statistics
  const userProposalsData = useMemo(() => {
    console.log("=== USER PROPOSALS CALCULATION ===");
    console.log("Proposals data for user calc:", proposalsData.length);
    console.log("Users data keys:", Object.keys(usersData).length);
    
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
    
    console.log("User counts calculated:", Object.keys(userCounts).length, "users");
    
    // Convert to array with user names
    const result = Object.entries(userCounts).map(([userId, stats], index) => ({
      name: usersData[userId] || 'Unknown',
      count: stats.count,
      fees: stats.fees,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.count - a.count);
    
    console.log("User proposals result:", result.length, "users");
    return result;
  }, [proposalsData, usersData]);
  
  // Summary statistics
  const summaryStats = useMemo(() => {
    console.log("=== SUMMARY STATS CALCULATION ===");
    console.log("Proposals data for summary:", proposalsData.length);
    
    if (!proposalsData.length) return { total: 0, totalFees: 0, averageFees: 0 };
    
    const total = proposalsData.length;
    const totalFees = proposalsData.reduce((sum, proposal) => sum + (proposal.fees_value || 0), 0);
    const averageFees = totalFees / total;
    
    const result = { total, totalFees, averageFees };
    console.log('Dashboard summary stats calculated:', result);
    
    return result;
  }, [proposalsData]);
  
  return { 
    dailyProposalsData,
    userProposalsData,
    summaryStats,
    isLoading
  };
}
