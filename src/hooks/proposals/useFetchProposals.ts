
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Proposal, ExtractedData } from '@/lib/types/proposals';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export const useFetchProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Função para buscar propostas
  const fetchProposals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }
      
      // Converter os dados do banco para o formato da aplicação
      const formattedProposals: Proposal[] = data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        userName: user.name || 'Unknown User',
        createdAt: item.created_at,
        data: {
          cnpj: item.cnpj || '',
          totalDebt: item.total_debt?.toString().replace('.', ',') || '0,00',
          discountedValue: item.discounted_value?.toString().replace('.', ',') || '0,00',
          discountPercentage: item.discount_percentage?.toString().replace('.', ',') || '0',
          entryValue: item.entry_value?.toString().replace('.', ',') || '0,00',
          installments: item.installments?.toString() || '0',
          installmentValue: item.installment_value?.toString().replace('.', ',') || '0,00',
          debtNumber: item.debt_number || '',
          feesValue: item.fees_value?.toString().replace('.', ',') || '0,00',
        },
        imageUrl: item.image_url || '',
      }));
      
      setProposals(formattedProposals);
      
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Erro ao carregar propostas",
        description: error.message || "Não foi possível carregar suas propostas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para deletar uma proposta
  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
      
      if (error) {
        if (error.message.includes('violates row-level security')) {
          throw new Error('Apenas administradores podem excluir propostas');
        }
        throw error;
      }
      
      // Atualiza a lista local
      setProposals(prev => prev.filter(p => p.id !== id));
      
      return true;
    } catch (error: any) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Erro ao excluir proposta",
        description: error.message || "Não foi possível excluir a proposta",
        variant: "destructive",
      });
      return false;
    }
  };

  // Carregar propostas inicialmente e quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);
  
  return { proposals, isLoading, fetchProposals, deleteProposal };
};
