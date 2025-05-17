
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtractedData, Proposal } from '@/lib/types/proposals';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useSaveProposal = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const formatDateBR = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };
  
  const calculateFees = (totalDebt: string, discountedValue: string): number => {
    try {
      const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedValueNum = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(totalDebtValue) || isNaN(discountedValueNum)) {
        return 0;
      }
      
      const economyValue = totalDebtValue - discountedValueNum;
      return economyValue * 0.2; // 20% of the savings
    } catch (e) {
      console.error('Error calculating fees:', e);
      return 0;
    }
  };
  
  const saveProposal = async (data: ExtractedData, imageUrl?: string): Promise<Proposal | null> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar propostas",
        variant: "destructive",
      });
      return null;
    }
    
    setIsSaving(true);
    
    try {
      // Calculate fees if not provided
      let feesValue = data.feesValue ? parseFloat(data.feesValue.replace(/\./g, '').replace(',', '.')) : null;
      
      if (!feesValue && data.totalDebt && data.discountedValue) {
        feesValue = calculateFees(data.totalDebt, data.discountedValue);
      }
      
      const now = new Date();
      
      // Prepare proposal data
      const proposalData = {
        user_id: user.id,
        cnpj: data.cnpj,
        debt_number: data.debtNumber,
        total_debt: parseFloat(data.totalDebt.replace(/\./g, '').replace(',', '.')),
        discounted_value: parseFloat(data.discountedValue.replace(/\./g, '').replace(',', '.')),
        discount_percentage: parseFloat(data.discountPercentage.replace(',', '.')),
        entry_value: parseFloat(data.entryValue.replace(/\./g, '').replace(',', '.')),
        entry_installments: parseInt(data.entryInstallments || "1"),
        installments: parseInt(data.installments),
        installment_value: parseFloat(data.installmentValue.replace(/\./g, '').replace(',', '.')),
        fees_value: feesValue,
        client_name: data.clientName || user.name || '',
        client_email: data.clientEmail || user.email || '',
        client_phone: data.clientPhone || '',
        business_activity: data.businessActivity || '',
        image_url: imageUrl || null,
        status: 'active',
        creation_date: now.toISOString()
        // validity_date will be set by the trigger
      };
      
      // Insert into Supabase
      const { data: savedProposal, error } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select('*, creation_date, validity_date')
        .single();
      
      if (error) {
        console.error('Error saving proposal:', error);
        throw new Error(error.message);
      }
      
      // Format the response to match our Proposal type
      const formattedProposal: Proposal = {
        id: savedProposal.id,
        userId: savedProposal.user_id,
        userName: user.name || 'Unknown User',
        createdAt: savedProposal.created_at,
        creationDate: savedProposal.creation_date,
        validityDate: savedProposal.validity_date,
        data: {
          cnpj: data.cnpj,
          totalDebt: data.totalDebt,
          discountedValue: data.discountedValue,
          discountPercentage: data.discountPercentage,
          entryValue: data.entryValue,
          entryInstallments: data.entryInstallments || '1',
          installments: data.installments,
          installmentValue: data.installmentValue,
          debtNumber: data.debtNumber,
          feesValue: feesValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00',
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          businessActivity: data.businessActivity,
          creationDate: savedProposal.creation_date ? formatDateBR(new Date(savedProposal.creation_date)) : undefined,
          validityDate: savedProposal.validity_date ? formatDateBR(new Date(savedProposal.validity_date)) : undefined,
        },
        imageUrl: savedProposal.image_url || '',
      };
      
      toast({
        title: "Proposta salva",
        description: "A proposta foi armazenada com sucesso!",
      });
      
      return formattedProposal;
      
    } catch (error: any) {
      console.error('Error saving proposal:', error);
      toast({
        title: "Erro ao salvar proposta",
        description: error.message || "Não foi possível salvar a proposta. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  return { saveProposal, isSaving };
};
