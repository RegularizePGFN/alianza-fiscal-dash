
import { useCallback } from "react";
import { ExtractedData, Proposal } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";

interface UseProposalHandlersParams {
  formData: Partial<ExtractedData>;
  setFormData: (data: Partial<ExtractedData>) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setGeneratedProposal: (generated: boolean) => void;
  selectedProposal: Proposal | null;
  setSelectedProposal: (proposal: Proposal | null) => void;
  setActiveTab: (tab: string) => void;
  setCompanyData: (data: any) => void;
  saveProposal: (data: ExtractedData, imageUrl?: string) => Promise<Proposal | null>;
  fetchProposals: () => Promise<void>;
  deleteProposal: (id: string) => Promise<boolean>;
  user: User | null;
}

export const useProposalHandlers = (params: UseProposalHandlersParams) => {
  const { toast } = useToast();

  const handleInputChange = useCallback((field: string, value: string) => {
    params.setFormData({
      ...params.formData,
      [field]: value
    });
  }, [params.setFormData, params.formData]);

  const handleGenerateProposal = useCallback(async () => {
    console.log("=== GENERATE PROPOSAL DEBUG ===");
    console.log("Form data:", params.formData);
    
    // Validate required fields
    if (!params.formData.cnpj || !params.formData.totalDebt || !params.formData.discountedValue) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha CNPJ, valor total da dívida e valor com desconto.",
        variant: "destructive",
      });
      return;
    }

    try {
      const savedProposal = await params.saveProposal(params.formData as ExtractedData, params.imagePreview || undefined);
      
      if (savedProposal) {
        console.log("Proposal saved successfully:", savedProposal.id);
        
        // ✅ CRUCIAL: Refresh the proposals list after saving
        await params.fetchProposals();
        console.log("Proposals list refreshed after save");
        
        params.setGeneratedProposal(true);
        params.setActiveTab("proposal");
        
        toast({
          title: "Proposta gerada com sucesso!",
          description: "A proposta foi salva e está disponível no histórico.",
        });
      }
    } catch (error: any) {
      console.error("Error generating proposal:", error);
      toast({
        title: "Erro ao gerar proposta",
        description: error.message || "Não foi possível gerar a proposta.",
        variant: "destructive",
      });
    }
  }, [params.formData, params.imagePreview, params.saveProposal, params.fetchProposals, params.setGeneratedProposal, params.setActiveTab, toast]);

  const handleViewProposal = useCallback((proposal: Proposal) => {
    console.log("Viewing proposal:", proposal.id);
    params.setSelectedProposal(proposal);
    params.setActiveTab("proposal");
    
    // Load proposal data into form
    params.setFormData(proposal.data);
    params.setGeneratedProposal(true);
  }, [params.setSelectedProposal, params.setActiveTab, params.setFormData, params.setGeneratedProposal]);

  const handleDeleteProposal = useCallback(async (id: string): Promise<boolean> => {
    console.log("Deleting proposal:", id);
    const success = await params.deleteProposal(id);
    
    if (success) {
      // ✅ CRUCIAL: Refresh the proposals list after deletion
      await params.fetchProposals();
      console.log("Proposals list refreshed after deletion");
      
      // If the deleted proposal was selected, clear it
      if (params.selectedProposal?.id === id) {
        params.setSelectedProposal(null);
        params.setActiveTab("upload");
      }
    }
    
    return success;
  }, [params.deleteProposal, params.fetchProposals, params.selectedProposal, params.setSelectedProposal, params.setActiveTab]);

  const handleProcessComplete = useCallback(() => {
    params.setGeneratedProposal(true);
    params.setActiveTab("proposal");
  }, [params.setGeneratedProposal, params.setActiveTab]);

  const handleReset = useCallback(() => {
    console.log("Resetting form");
    params.setFormData({
      feesInstallments: '2',
      feesPaymentMethod: 'cartao',
      entryInstallments: '1',
      showFeesInstallments: 'false',
      includeExecutiveData: 'true',
      executiveName: params.user?.name || '',
      executiveEmail: params.user?.email || '',
      executivePhone: ''
    });
    params.setImagePreview(null);
    params.setGeneratedProposal(false);
    params.setSelectedProposal(null);
    params.setActiveTab("upload");
    params.setCompanyData(null);
  }, [params.setFormData, params.setImagePreview, params.setGeneratedProposal, params.setSelectedProposal, params.setActiveTab, params.setCompanyData, params.user]);

  return {
    handleInputChange,
    handleGenerateProposal,
    handleViewProposal,
    handleDeleteProposal,
    handleProcessComplete,
    handleReset
  };
};
