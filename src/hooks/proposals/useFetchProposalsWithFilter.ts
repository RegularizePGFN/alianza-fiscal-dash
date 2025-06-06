
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Proposal } from '@/lib/types/proposals';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserRole } from '@/lib/types';
import { DateFilterType, DateRange } from '@/components/proposals/ProposalsDateFilter';

export const useFetchProposalsWithFilter = () => {
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

  const getDateRangeFromFilter = (filterType: DateFilterType, customRange?: DateRange) => {
    const now = new Date();
    
    switch (filterType) {
      case 'last7days':
        return {
          from: startOfDay(subDays(now, 7)),
          to: endOfDay(now)
        };
      case 'last30days':
        return {
          from: startOfDay(subDays(now, 30)),
          to: endOfDay(now)
        };
      case 'custom':
        if (customRange?.from && customRange?.to) {
          return {
            from: startOfDay(customRange.from),
            to: endOfDay(customRange.to)
          };
        }
        // If custom is selected but no range provided, fallback to last 7 days
        return {
          from: startOfDay(subDays(now, 7)),
          to: endOfDay(now)
        };
      default:
        return {
          from: startOfDay(subDays(now, 7)),
          to: endOfDay(now)
        };
    }
  };
  
  const fetchProposals = useCallback(async (filterType: DateFilterType = 'last7days', customRange?: DateRange) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const dateRange = getDateRangeFromFilter(filterType, customRange);
      const isAdmin = user.role === UserRole.ADMIN;
      
      // Query based on user role and date range
      let query = supabase.from('proposals').select('*');
      
      // Only filter by user_id if not an admin
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      // Add date filtering
      query = query
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Fetch all users for mapping names to proposals (especially for admins)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name');
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
      }
      
      // Create a map of user IDs to names for quick lookup
      const userMap = (usersData || []).reduce((acc, user) => {
        acc[user.id] = user.name;
        return acc;
      }, {} as Record<string, string>);
      
      const formattedProposals = data.map((item: any): Proposal => {
        // Calculate fees if not present but we have the necessary values
        let feesValue = item.fees_value;
        if (item.total_debt && item.discounted_value && !feesValue) {
          const totalDebt = parseFloat(String(item.total_debt));
          const discountedValue = parseFloat(String(item.discounted_value));
          const economyValue = totalDebt - discountedValue;
          feesValue = economyValue * 0.2; // 20% of the savings
        }
        
        // Get user name from the map for userName field (vendedor)
        const userName = userMap[item.user_id] || 'Unknown User';
        
        // IMPORTANT: Always use client_name from database for clientName, never the user name
        const clientName = item.client_name || 'Cliente não informado';
        
        return {
          id: item.id,
          userId: item.user_id,
          userName: userName, // This is the salesperson name
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
            clientName: clientName, // This should ALWAYS be the client name, never the salesperson
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
  }, [user, toast]);
  
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
