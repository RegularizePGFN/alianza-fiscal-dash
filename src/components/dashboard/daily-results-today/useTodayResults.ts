
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { calculateCommission } from "@/lib/utils";
import { calculateSupervisorBonus, isSupervisor } from "@/lib/supervisorUtils";

export interface TodayResults {
  totalSales: number;
  totalCommissions: number;
  proposalsCount: number;
  totalFees: number;
}

export function useTodayResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<TodayResults>({
    totalSales: 0,
    totalCommissions: 0,
    proposalsCount: 0,
    totalFees: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchTodayResults = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const isAdmin = user.role === UserRole.ADMIN;

      const queries = [];
      
      let salesQuery = supabase
        .from("sales")
        .select("*")
        .eq("sale_date", today);

      if (!isAdmin) {
        salesQuery = salesQuery.eq("salesperson_id", user.id);
      }
      queries.push(salesQuery);

      let proposalsQuery = supabase
        .from("proposals")
        .select("fees_value")
        .gte("created_at", `${today}T00:00:00`)
        .lt("created_at", `${today}T23:59:59`);

      if (!isAdmin) {
        proposalsQuery = proposalsQuery.eq("user_id", user.id);
      }
      queries.push(proposalsQuery);

      const [salesResult, proposalsResult] = await Promise.all(queries);
      
      if (salesResult.error) throw salesResult.error;
      if (proposalsResult.error) throw proposalsResult.error;

      const salesData = salesResult.data || [];
      const proposalsData = proposalsResult.data || [];

      const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.gross_amount), 0);
      const proposalsCount = proposalsData.length;
      const totalFees = proposalsData.reduce((sum, proposal) => sum + Number(proposal.fees_value || 0), 0);

      let totalCommissions = 0;

      if (isAdmin) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, contract_type, email")
          .eq("role", "vendedor");

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
        let teamTotalSales = 0;

        const salesByPerson = salesData.reduce((acc: any, sale) => {
          if (!acc[sale.salesperson_id]) {
            acc[sale.salesperson_id] = 0;
          }
          acc[sale.salesperson_id] += Number(sale.gross_amount);
          return acc;
        }, {});

        Object.entries(salesByPerson).forEach(([salespersonId, salesAmount]: [string, any]) => {
          const profile = profilesMap.get(salespersonId);
          const contractType = profile?.contract_type || 'PJ';
          
          if (!isSupervisor(profile?.email || '')) {
            teamTotalSales += salesAmount;
          }
          
          const commission = calculateCommission(salesAmount, contractType);
          totalCommissions += commission.amount;
        });

        const supervisorBonus = calculateSupervisorBonus(teamTotalSales);
        totalCommissions += supervisorBonus.amount;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("contract_type")
          .eq("id", user.id)
          .single();

        const contractType = profile?.contract_type || 'PJ';
        const commission = calculateCommission(totalSales, contractType);
        totalCommissions = commission.amount;
      }

      setResults({
        totalSales,
        totalCommissions,
        proposalsCount,
        totalFees,
      });
    } catch (error) {
      console.error("Error fetching today results:", error);
      setResults({
        totalSales: 0,
        totalCommissions: 0,
        proposalsCount: 0,
        totalFees: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.id) {
      fetchTodayResults();
    }
  }, [user?.id, fetchTodayResults]);

  return { results, loading };
}
