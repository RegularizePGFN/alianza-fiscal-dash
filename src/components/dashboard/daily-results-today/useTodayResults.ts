
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchTodayResults = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const isAdmin = user.role === UserRole.ADMIN;

        console.log("🔍 DEBUG HONORÁRIOS - Iniciando busca de resultados para hoje:", today);
        console.log("🔍 DEBUG HONORÁRIOS - Usuário:", user.name, "Admin:", isAdmin);

        // Fetch sales data
        let salesQuery = supabase
          .from("sales")
          .select("*")
          .eq("sale_date", today);

        if (!isAdmin) {
          salesQuery = salesQuery.eq("salesperson_id", user.id);
        }

        const { data: salesData, error: salesError } = await salesQuery;
        if (salesError) throw salesError;

        console.log("🔍 DEBUG HONORÁRIOS - Vendas encontradas:", salesData?.length || 0);

        // Fetch proposals data
        let proposalsQuery = supabase
          .from("proposals")
          .select("*")
          .gte("created_at", `${today}T00:00:00`)
          .lt("created_at", `${today}T23:59:59`);

        if (!isAdmin) {
          proposalsQuery = proposalsQuery.eq("user_id", user.id);
        }

        const { data: proposalsData, error: proposalsError } = await proposalsQuery;
        if (proposalsError) throw proposalsError;

        console.log("🔍 DEBUG HONORÁRIOS - Propostas encontradas:", proposalsData?.length || 0);
        
        // Log individual proposals with fees_value
        proposalsData?.forEach((proposal, index) => {
          console.log(`🔍 DEBUG HONORÁRIOS - Proposta ${index + 1}:`, {
            id: proposal.id,
            user_id: proposal.user_id,
            fees_value: proposal.fees_value,
            created_at: proposal.created_at
          });
        });

        // Calculate totals
        const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.gross_amount), 0) || 0;
        const proposalsCount = proposalsData?.length || 0;
        const totalFees = proposalsData?.reduce((sum, proposal) => {
          const feesValue = Number(proposal.fees_value || 0);
          console.log(`🔍 DEBUG HONORÁRIOS - Somando fees_value: ${feesValue} de proposta ${proposal.id}`);
          return sum + feesValue;
        }, 0) || 0;

        console.log("🔍 DEBUG HONORÁRIOS - Total de honorários calculado:", totalFees);

        let totalCommissions = 0;

        if (isAdmin) {
          // For admins, calculate team commissions
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, contract_type, email")
            .eq("role", "vendedor");

          const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
          let teamTotalSales = 0;

          // Group sales by salesperson and calculate commissions
          const salesByPerson = salesData?.reduce((acc: any, sale) => {
            if (!acc[sale.salesperson_id]) {
              acc[sale.salesperson_id] = 0;
            }
            acc[sale.salesperson_id] += Number(sale.gross_amount);
            return acc;
          }, {}) || {};

          // Calculate commissions for each salesperson
          Object.entries(salesByPerson).forEach(([salespersonId, salesAmount]: [string, any]) => {
            const profile = profilesMap.get(salespersonId);
            const contractType = profile?.contract_type || 'PJ';
            
            // Add to team total if not supervisor
            if (!isSupervisor(profile?.email || '')) {
              teamTotalSales += salesAmount;
            }
            
            const commission = calculateCommission(salesAmount, contractType);
            totalCommissions += commission.amount;
          });

          // Add supervisor bonus for admins only
          const supervisorBonus = calculateSupervisorBonus(teamTotalSales);
          totalCommissions += supervisorBonus.amount;
        } else {
          // For vendors, calculate only their commissions (no supervisor bonus)
          const { data: profile } = await supabase
            .from("profiles")
            .select("contract_type")
            .eq("id", user.id)
            .single();

          const contractType = profile?.contract_type || 'PJ';
          const commission = calculateCommission(totalSales, contractType);
          totalCommissions = commission.amount;
        }

        console.log("🔍 DEBUG HONORÁRIOS - Resultado final:", {
          totalSales,
          totalCommissions, 
          proposalsCount,
          totalFees
        });

        setResults({
          totalSales,
          totalCommissions,
          proposalsCount,
          totalFees,
        });
      } catch (error) {
        console.error("❌ Erro ao buscar resultados de hoje:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayResults();
  }, [user]);

  return { results, loading };
}
