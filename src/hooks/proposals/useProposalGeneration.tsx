
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { fetchCnpjData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { generateProposalFiles, fallbackGenerateProposalFiles } from "@/lib/services/puppeteerService";
import { getProposalHtml } from "@/lib/pdfUtils";
import { useRef } from "react";

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
  const { toast: uiToast } = useToast();
  const proposalRef = useRef<HTMLDivElement | null>(null);

  const handleGenerateProposal = async (): Promise<void> => {
    setGeneratedProposal(true);

    // Show loading toast
    toast.loading("Gerando proposta...", {
      id: "generate-proposal",
      duration: 10000,
    });

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
      try {
        const proposal = await saveProposal(processedData as ExtractedData, imagePreview || undefined);
        if (proposal) {
          try {
            // Find the proposal preview element
            const proposalElement = document.querySelector('.proposal-preview-container');
            
            if (proposalElement) {
              // Get HTML content for Puppeteer
              const htmlContent = getProposalHtml(proposalElement as HTMLElement);
              
              // Try to use the browser-compatible service
              try {
                const { pdfUrl, pngUrl } = await generateProposalFiles(htmlContent, processedData);
                
                // Update the proposal data to include the file URLs
                const updatedProposal = {
                  ...proposal,
                  data: {
                    ...proposal.data,
                    pdfUrl,
                    pngUrl,
                  }
                };
                
                // Update selected proposal with the file URLs
                setSelectedProposal(updatedProposal);
                
                // Success toast
                toast.success("Proposta gerada com sucesso!", {
                  id: "generate-proposal",
                  duration: 3000,
                });
              } catch (serviceError) {
                console.error("Error using generation service:", serviceError);
                
                // Fallback to client-side rendering
                if (proposalRef.current) {
                  try {
                    const { pdfUrl, pngUrl } = await fallbackGenerateProposalFiles(
                      proposalRef.current,
                      processedData
                    );
                    
                    // Update the proposal data to include the file URLs
                    const updatedProposal = {
                      ...proposal,
                      data: {
                        ...proposal.data,
                        pdfUrl,
                        pngUrl,
                      }
                    };
                    
                    // Update selected proposal with the file URLs
                    setSelectedProposal(updatedProposal);
                    
                    // Success toast with fallback notice
                    toast.success("Proposta gerada (modo alternativo)!", {
                      id: "generate-proposal",
                      duration: 3000,
                    });
                  } catch (fallbackError) {
                    console.error("Error in fallback generation:", fallbackError);
                    throw fallbackError;
                  }
                } else {
                  throw new Error("Proposal element not found for fallback rendering");
                }
              }
            } else {
              throw new Error("Proposal element not found");
            }
          } catch (renderError) {
            console.error("Error rendering proposal:", renderError);
            
            // Error toast
            toast.error("Erro ao renderizar a proposta", {
              id: "generate-proposal",
              duration: 3000,
            });
          }
          
          // On success, update the proposals list and navigate to proposal tab
          await fetchProposals();
          
          uiToast({
            title: "Proposta gerada",
            description: "Sua proposta foi gerada e armazenada com sucesso!"
          });
          
          // Important: Navigate to the proposal tab to show the final result
          setActiveTab("proposal");
        }
      } catch (error) {
        console.error("Error saving proposal:", error);
        
        toast.error("Erro ao gerar proposta", {
          id: "generate-proposal",
          duration: 3000,
        });
        
        uiToast({
          title: "Erro ao gerar proposta",
          description: "Ocorreu um erro ao gerar a proposta. Por favor, tente novamente.",
          variant: "destructive"
        });
      }
    }
    
    return Promise.resolve();
  };
  
  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    
    // Parse template data if stored as strings
    let templateColors = proposal.data.templateColors;
    
    // Importante: Preservar os dados do cliente da proposta
    setFormData({
      ...proposal.data,
      creationDate: proposal.data.creationDate || proposal.creationDate,
      validityDate: proposal.data.validityDate || proposal.validityDate,
      specialistName: proposal.data.specialistName || proposal.specialistName || user?.name,
      clientName: proposal.data.clientName || '',
      clientEmail: proposal.data.clientEmail || '',
      clientPhone: proposal.data.clientPhone || ''
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
  
  return {
    handleGenerateProposal,
    handleViewProposal,
    proposalRef
  };
};
