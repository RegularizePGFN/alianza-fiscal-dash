
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { fetchCnpjData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { generateProposalPdf } from "@/lib/pdfUtils";

interface UseProposalGenerationProps {
  formData: Partial<ExtractedData>;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setGeneratedProposal: (generated: boolean) => void;
  setActiveTab: (tab: string) => void;
  setCompanyData: (data: CompanyData | null) => void;
  setSelectedProposal: (proposal: Proposal | null) => void;
  saveProposal: (data: ExtractedData, imageUrl?: string | undefined) => Promise<Proposal | null>;
  fetchProposals: () => Promise<void>;
  user: any;
}

export const useProposalGeneration = ({
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
  setGeneratedProposal,
  setActiveTab,
  setCompanyData,
  setSelectedProposal,
  saveProposal,
  fetchProposals,
  user,
}: UseProposalGenerationProps) => {
  const { toast } = useToast();

  const handleGenerateProposal = async () => {
    setGeneratedProposal(true);

    // Ensure fees and other values have proper formatting
    const processedData = { ...formData };
    
    // Format currency values to have exactly 2 decimal places
    ['feesValue', 'totalDebt', 'discountedValue', 'entryValue', 'installmentValue'].forEach(field => {
      if (processedData[field as keyof ExtractedData]) {
        try {
          const value = processedData[field as keyof ExtractedData] as string;
          const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
          
          if (!isNaN(numValue)) {
            const formatted = numValue.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
            
            processedData[field as keyof ExtractedData] = formatted as any;
          }
        } catch (e) {
          console.error(`Error formatting ${field}:`, e);
        }
      }
    });

    // Save the proposal to Supabase
    if (processedData) {
      const proposal = await saveProposal(processedData as ExtractedData, imagePreview || undefined);
      if (proposal) {
        // On success, update the proposals list
        fetchProposals();
        setSelectedProposal(proposal);
        toast({
          title: "Proposta gerada",
          description: "Sua proposta foi gerada e armazenada com sucesso!"
        });
      }
    }
    setActiveTab("proposal");
  };
  
  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    
    // Parse template data if stored as strings
    let templateColors = proposal.data.templateColors;
    let templateLayout = proposal.data.templateLayout;
    
    // Importante: Preservar os dados do cliente da proposta
    setFormData({
      ...proposal.data,
      creationDate: proposal.data.creationDate || proposal.creationDate,
      validityDate: proposal.data.validityDate || proposal.validityDate,
      specialistName: proposal.data.specialistName || proposal.specialistName || user?.name,
      clientName: proposal.data.clientName || '',
      clientEmail: proposal.data.clientEmail || '',
      clientPhone: proposal.data.clientPhone || '',
      templateId: proposal.data.templateId || 'default',
      templateColors: templateColors || JSON.stringify({
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      }),
      templateLayout: templateLayout || JSON.stringify({
        sections: ['client', 'debt', 'payment', 'fees'],
        showHeader: true,
        showLogo: true,
        showWatermark: false
      })
    });
    
    setImagePreview(proposal.imageUrl);
    setGeneratedProposal(true);
    setActiveTab("proposal");

    // Fetch company data for this proposal
    if (proposal.data.cnpj) {
      fetchCnpjData(proposal.data.cnpj).then(data => {
        if (data) {
          setCompanyData(data);
        }
      }).catch(err => console.error("Error fetching company data:", err));
    }
  };
  
  // Função para exportar proposta como PDF
  const handleExportProposalToPdf = async (proposalRef: React.RefObject<HTMLDivElement>) => {
    if (!proposalRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando PDF em uma única página, aguarde...",
    });
    
    try {
      await generateProposalPdf(proposalRef.current, formData);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso em uma página!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    handleGenerateProposal,
    handleViewProposal,
    handleExportProposalToPdf
  };
};
