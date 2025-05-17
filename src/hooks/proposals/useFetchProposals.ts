
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Proposal } from '@/lib/types/proposals';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const formattedProposals = data.map((item: any): Proposal => {
        // Calculate fees if not present but we have the necessary values
        let feesValue = item.fees_value;
        if (item.total_debt && item.discounted_value && !feesValue) {
          const totalDebt = parseFloat(String(item.total_debt));
          const discountedValue = parseFloat(String(item.discounted_value));
          const economyValue = totalDebt - discountedValue;
          feesValue = economyValue * 0.2; // 20% of the savings
        }
        
        return {
          id: item.id,
          userId: item.user_id,
          userName: user.name || 'Unknown User',
          createdAt: item.created_at,
          creationDate: item.creation_date,
          validityDate: item.validity_date,
          data: {
            cnpj: item.cnpj,
            totalDebt: item.total_debt?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
            discountedValue: item.discounted_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
            discountPercentage: item.discount_percentage?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
            entryValue: item.entry_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
            entryInstallments: item.entry_installments?.toString() || '1',
            installments: item.installments?.toString() || '0',
            installmentValue: item.installment_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
            debtNumber: item.debt_number || '',
            feesValue: feesValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
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
