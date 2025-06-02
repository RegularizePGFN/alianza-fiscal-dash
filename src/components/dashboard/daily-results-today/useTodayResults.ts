
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { TodayResults } from "./types";

export function useTodayResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<TodayResults>({
    proposalsCount: 0,
    totalFees: 0,
    totalCommissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayResults = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get today's date in the user's timezone
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Create start and end timestamps for today
        const startOfDay = `${today}T00:00:00`;
        const endOfDay = `${today}T23:59:59`;
        
        console.log('Fetching data for date:', today);
        console.log('Time range:', startOfDay, 'to', endOfDay);
        console.log('User role:', user.role);
        
        // Determine if user is admin and should see consolidated data
        const isAdmin = user.role === UserRole.ADMIN;
        
        // Fetch today's proposals - for admin: all proposals, for others: only their own
        const proposalsQuery = supabase
          .from('proposals')
          .select('fees_value, user_id')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
          
        if (!isAdmin) {
          proposalsQuery.eq('user_id', user.id);
        }

        const { data: proposalsData, error: proposalsError } = await proposalsQuery;

        if (proposalsError) {
          console.error('Error fetching proposals:', proposalsError);
        } else {
          console.log('Proposals found:', proposalsData?.length || 0);
        }

        const proposalsCount = proposalsData?.length || 0;
        const totalFees = proposalsData?.reduce((sum, proposal) => 
          sum + (proposal.fees_value || 0), 0) || 0;

        // Fetch today's sales - for admin: all sales, for others: only their own
        const salesQuery = supabase
          .from('sales')
          .select('gross_amount, salesperson_id')
          .eq('sale_date', today);
          
        if (!isAdmin) {
          salesQuery.eq('salesperson_id', user.id);
        }

        const { data: salesData, error: salesError } = await salesQuery;

        if (salesError) {
          console.error('Error fetching sales:', salesError);
        } else {
          console.log('Sales found:', salesData?.length || 0);
        }

        if (!salesData || salesData.length === 0) {
          console.log('No sales found for today, setting commissions to 0');
          setResults({
            proposalsCount,
            totalFees,
            totalCommissions: 0
          });
          return;
        }

        // For admin, we need to calculate commissions for each salesperson
        let totalCommissions = 0;
        
        if (isAdmin) {
          // Group sales by salesperson and calculate commissions for each
          const salesBySalesperson = salesData.reduce((acc, sale) => {
            if (!acc[sale.salesperson_id]) {
              acc[sale.salesperson_id] = [];
            }
            acc[sale.salesperson_id].push(sale);
            return acc;
          }, {} as Record<string, typeof salesData>);

          // Get contract types for all salespersons
          const salespersonIds = Object.keys(salesBySalesperson);
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, contract_type')
            .in('id', salespersonIds);

          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return;
          }

          // Calculate commissions for each salesperson
          Object.entries(salesBySalesperson).forEach(([salespersonId, sales]) => {
            const profile = profilesData?.find(p => p.id === salespersonId);
            const contractType = profile?.contract_type || 'PJ';
            
            const salespersonCommissions = sales.reduce((sum, sale) => {
              const saleAmount = Number(sale.gross_amount) || 0;
              
              let commissionRate = 0;
              if (contractType === 'CLT') {
                commissionRate = saleAmount >= 10000 ? 0.1 : 0.05; // 10% or 5%
              } else {
                commissionRate = saleAmount >= 10000 ? 0.25 : 0.2; // 25% or 20%
              }
              
              return sum + (saleAmount * commissionRate);
            }, 0);
            
            totalCommissions += salespersonCommissions;
          });
        } else {
          // For non-admin users, calculate only their own commissions
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('contract_type')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return;
          }

          const contractType = profileData?.contract_type || 'PJ';
          console.log('User contract type:', contractType);

          totalCommissions = salesData.reduce((sum, sale) => {
            const saleAmount = Number(sale.gross_amount) || 0;
            
            let commissionRate = 0;
            if (contractType === 'CLT') {
              commissionRate = saleAmount >= 10000 ? 0.1 : 0.05; // 10% or 5%
            } else {
              commissionRate = saleAmount >= 10000 ? 0.25 : 0.2; // 25% or 20%
            }
            
            return sum + (saleAmount * commissionRate);
          }, 0);
        }

        console.log('Final results:', {
          proposalsCount,
          totalFees,
          totalCommissions,
          isAdmin
        });

        setResults({
          proposalsCount,
          totalFees,
          totalCommissions
        });
      } catch (error) {
        console.error('Error fetching today results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayResults();
  }, [user]);

  return { results, loading };
}
