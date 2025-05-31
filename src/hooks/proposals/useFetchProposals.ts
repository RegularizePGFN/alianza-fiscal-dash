
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Proposal } from '@/lib/types/proposals';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserRole } from '@/lib/types';

export const useFetchProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const formatDateBR = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (e) {
      return date;
    }
  };

  const fetchProposals = useCallback(async () => {
    if (!user) {
      console.log("No user found, skipping proposals fetch");
      return;
    }

    setIsLoading(true);

    try {
      console.log("=== FETCH PROPOSALS DEBUG ===");
      console.log("Current user:", user.name, "Role:", user.role, "Email:", user.email);

      const isAdmin = user.role === UserRole.ADMIN;

      let proposalsQuery = supabase
        .from('proposals')
        .select(`
          id,
          user_id,
          created_at,
          cnpj,
          debt_number,
          total_debt,
          discounted_value,
          discount_percentage,
          entry_value,
          entry_installments,
          installments,
          installment_value,
          fees_value,
          client_name,
          client_email,
          client_phone,
          business_activity,
          creation_date,
          validity_date,
          status
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to improve performance

      if (!isAdmin) {
        proposalsQuery = proposalsQuery.eq('user_id', user.id);
      }

      const { data, error } = await proposalsQuery;

      console.log("Proposals query result:", { count: data?.length || 0, error });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log("No proposals found");
        setProposals([]);
        return;
      }

      // Get unique user IDs from proposals
      const uniqueUserIds = [...new Set(data.map(p => p.user_id))];

      if (uniqueUserIds.length === 0) {
        console.log("No user IDs found in proposals");
        setProposals([]);
        return;
      }

      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', uniqueUserIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        // Continue without user names rather than failing completely
      }

      console.log("Users data fetched:", usersData?.length || 0);

      // Filter for vendors if admin
      let finalProposals = data;
      if (isAdmin && usersData) {
        const vendorUserIds = usersData
          .filter(user => user.role === 'vendedor')
          .map(user => user.id);

        console.log("Vendor user IDs:", vendorUserIds);

        if (vendorUserIds.length > 0) {
          finalProposals = data.filter(proposal =>
            vendorUserIds.includes(proposal.user_id)
          );
        } else {
          console.log("No vendor users found");
          finalProposals = [];
        }
      }

      // Create user mapping
      const userMap = (usersData || []).reduce((acc, user) => {
        acc[user.id] = { name: user.name, role: user.role };
        return acc;
      }, {} as Record<string, { name: string; role: string }>);

      // Format proposals
      const formattedProposals = finalProposals.map((item): Proposal => {
        const totalDebt = parseFloat(item.total_debt?.toString() || '0');
        const discountedValue = parseFloat(item.discounted_value?.toString() || '0');
        
        let feesValue = parseFloat(item.fees_value?.toString() || '0');
        if (!Number.isFinite(feesValue) || feesValue === 0) {
          const economyValue = totalDebt - discountedValue;
          feesValue = Number.isFinite(economyValue) ? economyValue * 0.2 : 0;
        }

        const userInfo = userMap[item.user_id] || { name: 'Usuário desconhecido', role: 'USER' };

        return {
          id: item.id,
          userId: item.user_id,
          userName: userInfo.name,
          createdAt: item.created_at,
          creationDate: item.creation_date,
          validityDate: item.validity_date,
          data: {
            cnpj: item.cnpj || '',
            totalDebt: totalDebt.toString(),
            discountedValue: discountedValue.toString(),
            discountPercentage: (item.discount_percentage?.toString() || '0'),
            entryValue: (item.entry_value?.toString() || '0'),
            entryInstallments: (item.entry_installments?.toString() || '1'),
            installments: (item.installments?.toString() || '0'),
            installmentValue: (item.installment_value?.toString() || '0'),
            debtNumber: item.debt_number || '',
            feesValue: feesValue.toString(),
            clientName: item.client_name || '',
            clientEmail: item.client_email || '',
            clientPhone: item.client_phone || '',
            businessActivity: item.business_activity || '',
            creationDate: item.creation_date ? formatDateBR(item.creation_date) : undefined,
            validityDate: item.validity_date ? formatDateBR(item.validity_date) : undefined,
          },
          imageUrl: '', // Remove image URL to improve performance
        };
      });

      console.log("Successfully formatted proposals:", formattedProposals.length);
      setProposals(formattedProposals);

    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Erro ao carregar propostas",
        description: error.message || "Não foi possível carregar as propostas.",
        variant: "destructive",
      });
      setProposals([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, toast]); // Only depend on user ID and role

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Update local state immediately
      setProposals(prevProposals => prevProposals.filter(p => p.id !== id));

      toast({
        title: "Proposta excluída",
        description: "A proposta foi excluída com sucesso."
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Erro ao excluir proposta",
        description: error.message || "Não foi possível excluir a proposta.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { proposals, isLoading, fetchProposals, deleteProposal };
};
