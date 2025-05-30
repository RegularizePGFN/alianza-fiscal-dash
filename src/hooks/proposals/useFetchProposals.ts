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
      
      // Check if current user is admin
      const isAdmin = user.role === UserRole.ADMIN;
      console.log("Is admin:", isAdmin);
      
      // Base query for proposals - WITHOUT DATE FILTER FOR TESTING
      let proposalsQuery = supabase.from('proposals').select('*');
      
      if (!isAdmin) {
        console.log("Regular user - fetching own proposals only");
        // For non-admins, only show their own proposals
        proposalsQuery = proposalsQuery.eq('user_id', user.id);
      } else {
        console.log("Admin detected - will filter for vendor proposals after loading users");
      }
      
      // Order by created_at desc
      proposalsQuery = proposalsQuery.order('created_at', { ascending: false });
      
      const { data, error } = await proposalsQuery;
      
      console.log("Proposals query result:", { data: data?.length || 0, error });
      console.log("Raw proposals data:", data?.slice(0, 3)); // Show first 3 proposals
      
      if (error) {
        console.error("Query error:", error);
        throw new Error(error.message);
      }
      
      // Get unique user IDs from proposals
      const uniqueUserIds = [...new Set((data || []).map(p => p.user_id))];
      console.log("Unique user IDs from proposals:", uniqueUserIds);
      
      if (uniqueUserIds.length === 0) {
        console.log("No user IDs found in proposals");
        setProposals([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch users based on the user_ids from proposals
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', uniqueUserIds);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
      }
      
      console.log("Users data fetched:", usersData?.length || 0);
      console.log("Users details:", usersData?.map(u => ({ id: u.id, name: u.name, role: u.role })));
      
      // For admins, filter proposals to show only from vendedor users
      let finalProposals = data || [];
      if (isAdmin && usersData) {
        const vendorUserIds = usersData
          .filter(user => user.role === 'vendedor')
          .map(user => user.id);
        
        console.log("Vendor user IDs:", vendorUserIds);
        
        if (vendorUserIds.length > 0) {
          finalProposals = data?.filter(proposal => 
            vendorUserIds.includes(proposal.user_id)
          ) || [];
          console.log("Filtered proposals for vendors:", finalProposals.length);
        } else {
          console.log("No vendor users found, showing empty result");
          finalProposals = [];
        }
      }
      
      // Create a map of user IDs to user info for quick lookup
      const userMap = (usersData || []).reduce((acc, user) => {
        acc[user.id] = { name: user.name, role: user.role };
        return acc;
      }, {} as Record<string, { name: string; role: string }>);
      
      console.log("User map created:", Object.keys(userMap).length, "users");
      
      const formattedProposals = finalProposals.map((item: any): Proposal => {
        // Calculate fees if not present but we have the necessary values
        let feesValue = item.fees_value;
        if (item.total_debt && item.discounted_value && !feesValue) {
          const totalDebt = parseFloat(String(item.total_debt));
          const discountedValue = parseFloat(String(item.discounted_value));
          const economyValue = totalDebt - discountedValue;
          feesValue = economyValue * 0.2; // 20% of the savings
        }
        
        // Get user info from the map
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
      
      console.log('Final formatted proposals:', formattedProposals.length);
      console.log('Sample proposals:', formattedProposals.slice(0, 3).map(p => ({
        id: p.id,
        userName: p.userName,
        clientName: p.data.clientName,
        createdAt: p.createdAt,
        feesValue: p.data.feesValue
      })));
      
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
