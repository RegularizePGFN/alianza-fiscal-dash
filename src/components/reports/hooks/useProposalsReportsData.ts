
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

interface ProposalReportData {
  id: string;
  user_id: string;
  user_name: string;
  created_at: string;
  cnpj: string | null;
  client_name: string | null;
  debt_number: string | null;
  total_debt: number | null;
  discounted_value: number | null;
  discount_percentage: number | null;
  entry_value: number | null;
  installments: number | null;
  fees_value: number | null;
  business_activity: string | null;
}

interface ProposalsReportsSummary {
  totalProposals: number;
  totalFees: number;
  averageFees: number;
  totalDebt: number;
  totalDiscountedValue: number;
  activeSalespeople: number;
}

export const useProposalsReportsData = (selectedMonth: number, selectedYear: number) => {
  const { user } = useAuth();
  const [proposalsData, setProposalsData] = useState<ProposalReportData[]>([]);
  const [summary, setSummary] = useState<ProposalsReportsSummary>({
    totalProposals: 0,
    totalFees: 0,
    averageFees: 0,
    totalDebt: 0,
    totalDiscountedValue: 0,
    activeSalespeople: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposalsData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        console.log("=== PROPOSALS REPORTS DATA FETCH ===");
        console.log("Fetching for month:", selectedMonth, "year:", selectedYear);
        console.log("Current user:", user.name, "Role:", user.role);
        
        // Construir filtros de data
        const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
        
        console.log("Date range:", startDate, "to", endDate);
        
        // Query base para propostas
        let query = supabase
          .from('proposals')
          .select(`
            id,
            user_id,
            created_at,
            cnpj,
            client_name,
            debt_number,
            total_debt,
            discounted_value,
            discount_percentage,
            entry_value,
            installments,
            fees_value,
            business_activity
          `)
          .eq('status', 'active')
          .gte('created_at', startDate)
          .lt('created_at', endDate)
          .order('created_at', { ascending: false });

        // Se não for admin, filtrar apenas as próprias propostas
        if (user.role !== UserRole.ADMIN) {
          console.log("Regular user - filtering own proposals only");
          query = query.eq('user_id', user.id);
        }

        const { data: proposals, error: proposalsError } = await query;

        if (proposalsError) {
          console.error('Error fetching proposals:', proposalsError);
          throw proposalsError;
        }

        console.log("Proposals fetched:", proposals?.length || 0);

        if (!proposals || proposals.length === 0) {
          console.log("No proposals found for the period");
          setProposalsData([]);
          setSummary({
            totalProposals: 0,
            totalFees: 0,
            averageFees: 0,
            totalDebt: 0,
            totalDiscountedValue: 0,
            activeSalespeople: 0
          });
          return;
        }

        // Buscar nomes dos usuários
        const uniqueUserIds = [...new Set(proposals.map(p => p.user_id))];
        console.log("Unique user IDs:", uniqueUserIds.length);

        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, role')
          .in('id', uniqueUserIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          // Continuar sem nomes ao invés de falhar
        }

        console.log("Users data fetched:", users?.length || 0);

        // Para admins, filtrar apenas propostas de vendedores
        let filteredProposals = proposals;
        if (user.role === UserRole.ADMIN && users) {
          const vendorUserIds = users
            .filter(u => u.role === 'vendedor')
            .map(u => u.id);

          console.log("Vendor user IDs:", vendorUserIds.length);

          if (vendorUserIds.length > 0) {
            filteredProposals = proposals.filter(proposal =>
              vendorUserIds.includes(proposal.user_id)
            );
            console.log("Filtered proposals for vendors:", filteredProposals.length);
          } else {
            console.log("No vendor users found");
            filteredProposals = [];
          }
        }

        // Criar mapeamento de usuários
        const userMap = (users || []).reduce((acc, user) => {
          acc[user.id] = user.name;
          return acc;
        }, {} as Record<string, string>);

        // Formatar dados das propostas
        const formattedProposals: ProposalReportData[] = filteredProposals.map(proposal => ({
          id: proposal.id,
          user_id: proposal.user_id,
          user_name: userMap[proposal.user_id] || 'Usuário Desconhecido',
          created_at: proposal.created_at,
          cnpj: proposal.cnpj,
          client_name: proposal.client_name,
          debt_number: proposal.debt_number,
          total_debt: proposal.total_debt,
          discounted_value: proposal.discounted_value,
          discount_percentage: proposal.discount_percentage,
          entry_value: proposal.entry_value,
          installments: proposal.installments,
          fees_value: proposal.fees_value,
          business_activity: proposal.business_activity
        }));

        // Calcular resumo
        const totalFees = filteredProposals.reduce((sum, proposal) => {
          const fees = parseFloat(proposal.fees_value?.toString() || '0');
          return sum + (isNaN(fees) ? 0 : fees);
        }, 0);

        const totalDebt = filteredProposals.reduce((sum, proposal) => {
          const debt = parseFloat(proposal.total_debt?.toString() || '0');
          return sum + (isNaN(debt) ? 0 : debt);
        }, 0);

        const totalDiscountedValue = filteredProposals.reduce((sum, proposal) => {
          const discounted = parseFloat(proposal.discounted_value?.toString() || '0');
          return sum + (isNaN(discounted) ? 0 : discounted);
        }, 0);

        const uniqueSalespeople = new Set(filteredProposals.map(proposal => proposal.user_id));

        const calculatedSummary: ProposalsReportsSummary = {
          totalProposals: filteredProposals.length,
          totalFees,
          averageFees: filteredProposals.length > 0 ? totalFees / filteredProposals.length : 0,
          totalDebt,
          totalDiscountedValue,
          activeSalespeople: uniqueSalespeople.size
        };

        console.log("Summary calculated:", calculatedSummary);

        setProposalsData(formattedProposals);
        setSummary(calculatedSummary);

      } catch (error) {
        console.error('Error processing proposals data:', error);
        setProposalsData([]);
        setSummary({
          totalProposals: 0,
          totalFees: 0,
          averageFees: 0,
          totalDebt: 0,
          totalDiscountedValue: 0,
          activeSalespeople: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProposalsData();
  }, [user, selectedMonth, selectedYear]);

  return { proposalsData, summary, loading };
};
