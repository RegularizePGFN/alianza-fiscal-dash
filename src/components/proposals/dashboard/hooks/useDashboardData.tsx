
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
        
        // Check if current user is admin
        const isAdmin = user.role === UserRole.ADMIN;
        console.log("Dashboard - Is admin:", isAdmin);
        
        // Query proposals WITHOUT date filter for testing
        let query = supabase
          .from('proposals')
          .select('id, user_id, created_at, total_debt, discounted_value, fees_value');
        
        console.log("Dashboard - Fetching ALL proposals (no date filter for testing)");
        
        if (isAdmin) {
          console.log("Dashboard - Admin detected, filtering for vendor proposals only");
          
          // For admins, get all users with role 'vendedor' (from database)
          const { data: vendorUsers, error: vendorUsersError } = await supabase
            .from('profiles')
            .select('id, name, role')
            .eq('role', 'vendedor'); // Use exact database value
          
          if (vendorUsersError) {
            console.error('Dashboard - Error fetching vendor users:', vendorUsersError);
            return;
          }
          
          console.log("Dashboard - Found vendor users:", vendorUsers?.length || 0);
          console.log("Dashboard - Vendor users details:", vendorUsers?.map(u => ({ id: u.id, name: u.name, role: u.role })));
          
          if (vendorUsers && vendorUsers.length > 0) {
            const vendorUserIds = vendorUsers.map(vendor => vendor.id);
            console.log("Dashboard - Vendor user IDs:", vendorUserIds);
            
            // Filter to show only proposals from vendor users
            query = query.in('user_id', vendorUserIds);
          } else {
            console.log("Dashboard - No vendor users found");
            setProposalsData([]);
            setUsersData({});
            setIsLoading(false);
            return;
          }
        } else {
          console.log("Dashboard - Regular user, showing own proposals only");
          // For non-admins, only their own proposals
          query = query.eq('user_id', user.id);
        }
        
        const { data: proposals, error: proposalsError } = await query;
        
        console.log("Dashboard - Proposals query result:", { count: proposals?.length || 0, error: proposalsError });
        console.log("Dashboard - Raw proposals data (first 3):", proposals?.slice(0, 3));
        
        if (proposalsError) {
          console.error('Dashboard - Error fetching proposals:', proposalsError);
          return;
        }
        
        // Fetch users data for mapping (only vendedor users for admins)
        let usersQuery = supabase
          .from('profiles')
          .select('id, name, role');
        
        if (isAdmin) {
          // Only include vendedor users in the mapping for admins
          usersQuery = usersQuery.eq('role', 'vendedor');
        }
        
        const { data: users, error: usersError } = await usersQuery;
        
        if (usersError) {
          console.error('Dashboard - Error fetching users:', usersError);
          return;
        }
        
        console.log("Dashboard - Users data fetched:", users?.length || 0);
        console.log("Dashboard - Users details:", users?.map(u => ({ id: u.id, name: u.name, role: u.role })));
        
        // Create a mapping of user IDs to names
        const userMap = (users || []).reduce((acc, user) => {
          acc[user.id] = user.name;
          return acc;
        }, {} as Record<string, string>);
        
        console.log('Dashboard - User mapping created:', Object.keys(userMap).length, 'users');
        console.log('Dashboard - User mapping sample:', Object.entries(userMap).slice(0, 3));
        
        setProposalsData(proposals || []);
        setUsersData(userMap);
        
        console.log("Dashboard - Final data set:", {
          proposalsCount: proposals?.length || 0,
          usersCount: Object.keys(userMap).length,
          sampleProposal: proposals?.[0] ? {
            id: proposals[0].id,
            user_id: proposals[0].user_id,
            fees_value: proposals[0].fees_value,
            created_at: proposals[0].created_at
          } : null
        });
      } catch (error) {
        console.error('Dashboard - Error processing data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Daily proposals count for the current month
  const dailyProposalsData = useMemo(() => {
    console.log("=== DAILY PROPOSALS CALCULATION ===");
    console.log("Proposals data for daily calc:", proposalsData.length);
    console.log("Sample proposals data:", proposalsData.slice(0, 2).map(p => ({
      id: p.id,
      user_id: p.user_id,
      created_at: p.created_at,
      fees_value: p.fees_value
    })));
    
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
      console.log("Processing proposal date:", dateStr, "Proposal ID:", proposal.id);
      if (dailyCounts[dateStr]) {
        dailyCounts[dateStr].count += 1;
        dailyCounts[dateStr].fees += proposal.fees_value || 0;
        console.log("Added to day", dateStr, "- count:", dailyCounts[dateStr].count, "fees:", dailyCounts[dateStr].fees);
      } else {
        console.log("Date", dateStr, "not in current month range");
      }
    });
    
    const result = Object.values(dailyCounts).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
    
    console.log("Daily proposals result:", result.slice(0, 5));
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
    
    console.log("User counts calculated:", userCounts);
    
    // Convert to array with user names
    const result = Object.entries(userCounts).map(([userId, stats], index) => ({
      name: usersData[userId] || 'Unknown',
      count: stats.count,
      fees: stats.fees,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.count - a.count);
    
    console.log("User proposals result:", result);
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
