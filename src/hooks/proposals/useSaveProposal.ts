
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtractedData, Proposal } from '@/lib/types/proposals';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

export const useSaveProposal = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
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
      // Prepare proposal data
      const proposalData = {
        user_id: user.id,
        cnpj: data.cnpj,
        debt_number: data.debtNumber,
        total_debt: parseFloat(data.totalDebt.replace('.', '').replace(',', '.')),
        discounted_value: parseFloat(data.discountedValue.replace('.', '').replace(',', '.')),
        discount_percentage: parseFloat(data.discountPercentage.replace(',', '.')),
        entry_value: parseFloat(data.entryValue.replace('.', '').replace(',', '.')),
        // For now, we'll handle entry_installments in the frontend only
        // The column needs to be added to the database schema
        installments: parseInt(data.installments),
        installment_value: parseFloat(data.installmentValue.replace('.', '').replace(',', '.')),
        fees_value: data.feesValue ? parseFloat(data.feesValue.replace('.', '').replace(',', '.')) : null,
        client_name: data.clientName || user.name || '',
        client_email: data.clientEmail || user.email || '',
        client_phone: data.clientPhone || '',
        business_activity: data.businessActivity || '',
        image_url: imageUrl || null,
        status: 'active'
      };
      
      // Insert into Supabase
      const { data: savedProposal, error } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
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
          feesValue: data.feesValue || '0,00',
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          businessActivity: data.businessActivity,
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
