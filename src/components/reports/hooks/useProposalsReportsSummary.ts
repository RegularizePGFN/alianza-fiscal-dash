
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

interface ProposalsReportsSummary {
  totalProposals: number;
  totalFees: number;
  averageFees: number;
  activeSalespeople: number;
}

export const useProposalsReportsSummary = (selectedMonth: number, selectedYear: number) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProposalsReportsSummary>({
    totalProposals: 0,
    totalFees: 0,
    averageFees: 0,
    activeSalespeople: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Buscar propostas do mês/ano específico
        const { data: proposals, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('status', 'active')
          .gte('created_at', `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`)
          .lt('created_at', `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`);

        if (error) throw error;

        if (proposals && proposals.length > 0) {
          // Se não for admin, filtrar apenas as próprias propostas
          let filteredProposals = proposals;
          if (user.role !== UserRole.ADMIN) {
            filteredProposals = proposals.filter(proposal => proposal.user_id === user.id);
          } else {
            // Para admin, buscar apenas propostas de vendedores
            const { data: users } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('role', 'vendedor');

            if (users) {
              const vendorIds = users.map(u => u.id);
              filteredProposals = proposals.filter(proposal => vendorIds.includes(proposal.user_id));
            }
          }

          const totalFees = filteredProposals.reduce((sum, proposal) => {
            const fees = parseFloat(proposal.fees_value?.toString() || '0');
            return sum + (isNaN(fees) ? 0 : fees);
          }, 0);

          const uniqueSalespeople = new Set(filteredProposals.map(proposal => proposal.user_id));

          setSummary({
            totalProposals: filteredProposals.length,
            totalFees,
            averageFees: filteredProposals.length > 0 ? totalFees / filteredProposals.length : 0,
            activeSalespeople: uniqueSalespeople.size
          });
        } else {
          setSummary({
            totalProposals: 0,
            totalFees: 0,
            averageFees: 0,
            activeSalespeople: 0
          });
        }
      } catch (error) {
        console.error('Error fetching proposals summary:', error);
        setSummary({
          totalProposals: 0,
          totalFees: 0,
          averageFees: 0,
          activeSalespeople: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user, selectedMonth, selectedYear]);

  return { summary, loading };
};
