import { useState } from 'react';
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

  const fetchProposals = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      console.log("=== FETCH PROPOSALS DEBUG ===");
      console.log("Current user:", user.name, "Role:", user.role, "Email:", user.email);

      const isAdmin = user.role === UserRole.ADMIN;

      let proposalsQuery = supabase.from('proposals').select('*');

      if (!isAdmin) {
        proposalsQuery = proposalsQuery.eq('user_id', user.id);
      }

      proposalsQuery = proposalsQuery.order('created_at', { ascending: false });

      const { data, error } = await proposalsQuery;

      console.log("Proposals query result:", { data: data?.length || 0, error });
      console.log("Raw proposals data:", data?.slice(0, 3));

      if (error) {
        throw new Error(error.message);
      }

      const uniqueUserIds = [...new Set((data || []).map(p => p.user_id))];

      if (uniqueUserIds.length === 0) {
        console.log("No user IDs found in proposals");
        setProposals([]);
        setIsLoading(false);
        return;
      }

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', uniqueUserIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      console.log("Users data fetched:", usersData?.length || 0);

      let finalProposals = data || [];

      if (isAdmin && usersData) {
        const vendorUserIds = usersData
          .filter(user => user.role === 'vendedor')
          .map(user => user.id);

        console.log("Vendor user IDs:", vendorUserIds);

        if (vendorUserIds.length > 0) {
          finalProposals = finalProposals.filter(proposal =>
            vendorUserIds.includes(proposal.user_id)
          );
        } else {
          console.log("No vendor users found, returning empty");
          finalProposals = [];
        }
      }

      const userMap = (usersData || []).reduce((acc, user) => {
        acc[user.id] = { name: user.name, role: user.role };
        return acc;
      }, {} as Record<string, { name: string; role: string }>);

      const formattedProposals = finalProposals.map((item: any): Proposal => {
        const totalDebt = parseFloat(item.total_debt || '0');
        const discountedValue = parseFloat(item.discounted_value || '0');
        const economyValue = totalDebt - discountedValue;

        let feesValue = parseFloat(item.fees_value || '');
        if (!Number.isFinite(feesValue) || feesValue === 0) {
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
            cnpj: item.cnpj,
            totalDebt: totalDebt,
            discountedValue: discountedValue,
            discountPercentage: parseFloat(item.discount_percentage || '0'),
            entryValue: parseFloat(item.entry_value || '0'),
            entryInstallments: item.entry_installments?.toString() || '1',
            installments: item.installments?.toString() || '0',
            installmentValue: parseFloat(item.installment_value || '0'),
            debtNumber: item.debt_number || '',
            feesValue: feesValue,
            clientName: item.client_name,
            clientEmail: item.client_email,
            clientPhone: item.client_phone,
            businessActivity: item.business_activity,
            creationDate: item.creation_date ? formatDateBR(item.creation_date) : undefined,
            validityDate: item.validity_date ? formatDateBR(item.validity_date) : undefined,
          },
          imageUrl: item.image_url || '',
        };
      });

      console.log("Formatted proposals:", formattedProposals.length);
      console.log("Sample proposal preview:", formattedProposals.slice(0, 3));

      setProposals(formattedProposals);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Erro ao carregar propostas",
        description: error.message || "Não foi possível carregar as propostas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

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