
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Proposal } from '@/lib/types/proposals';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export const useFetchProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchProposals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const formattedProposals = data.map((item: any): Proposal => ({
        id: item.id,
        userId: item.user_id,
        userName: user.name || 'Unknown User',
        createdAt: item.created_at,
        data: {
          cnpj: item.cnpj,
          totalDebt: item.total_debt?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
          discountedValue: item.discounted_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
          discountPercentage: item.discount_percentage?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
          entryValue: item.entry_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
          entryInstallments: item.entry_installments?.toString() || '1', // Added field
          installments: item.installments?.toString() || '0',
          installmentValue: item.installment_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
          debtNumber: item.debt_number || '',
          feesValue: item.fees_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
          clientName: item.client_name,
          clientEmail: item.client_email,
          clientPhone: item.client_phone,
          businessActivity: item.business_activity,
        },
        imageUrl: item.image_url || '',
      }));
      
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
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state by removing the deleted proposal
      setProposals(prevProposals => prevProposals.filter(proposal => proposal.id !== id));
      
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
