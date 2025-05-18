
import { ChangeEvent } from "react";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { fetchCnpjData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UseProposalHandlersProps {
  formData: Partial<ExtractedData>;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  setGeneratedProposal: (generated: boolean) => void;
  selectedProposal: Proposal | null;
  setSelectedProposal: (proposal: Proposal | null) => void;
  setActiveTab: (tab: string) => void;
  setCompanyData: (data: CompanyData | null) => void;
  saveProposal: (data: ExtractedData, imageUrl?: string | undefined) => Promise<Proposal | null>;
  fetchProposals: () => Promise<void>;
  deleteProposal: (id: string) => Promise<boolean>;
  user: any;
}

export const useProposalHandlers = ({
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
  setGeneratedProposal,
  selectedProposal,
  setSelectedProposal,
  setActiveTab,
  setCompanyData,
  saveProposal,
  fetchProposals,
  deleteProposal,
  user,
}: UseProposalHandlersProps) => {
  const { toast } = useToast();

  const handleProcessComplete = (data: Partial<ExtractedData>, preview: string) => {
    // Calculate creation date and validity date
    const now = new Date();
    const validityDate = addDays(now, 1);
    
    setFormData(prev => {
      // Calculate fees if possible
      let feesValue = data.feesValue;
      if (data.totalDebt && data.discountedValue && !feesValue) {
        try {
          const totalDebtValue = parseFloat(data.totalDebt.replace(/\./g, '').replace(',', '.'));
          const discountedValue = parseFloat(data.discountedValue.replace(/\./g, '').replace(',', '.'));
          const economyValue = totalDebtValue - discountedValue;
          // Format with exactly 2 decimal places
          feesValue = (economyValue * 0.2).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        } catch (e) {
          console.error("Error calculating fees:", e);
        }
      }
      
      return {
        ...prev,
        ...data,
        feesValue: feesValue || prev.feesValue || '0,00',
        // Make sure entryInstallments is set, defaulting to '1' if not provided
        entryInstallments: data.entryInstallments || prev.entryInstallments || '1',
        // Ensure user data is preserved
        clientName: data.clientName || user?.name || prev.clientName || '',
        clientEmail: data.clientEmail || user?.email || prev.clientEmail || '',
        // Set default specialist name
        specialistName: prev.specialistName || user?.name || '',
        // Set creation and validity dates
        creationDate: format(now, "yyyy-MM-dd'T'HH:mm:ss", { locale: ptBR }),
        validityDate: format(validityDate, "yyyy-MM-dd'T'HH:mm:ss", { locale: ptBR }),
        // Set default template
        templateId: prev.templateId || 'default',
        templateColors: prev.templateColors || JSON.stringify({
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#10B981',
          background: '#F8FAFC'
        }),
        templateLayout: prev.templateLayout || JSON.stringify({
          sections: ['client', 'debt', 'payment', 'fees'],
          showHeader: true,
          showLogo: true,
          showWatermark: false
        })
      };
    });
    
    // If we have CNPJ, fetch company data
    if (data.cnpj) {
      fetchCnpjData(data.cnpj).then(companyData => {
        if (companyData) {
          setCompanyData(companyData);
          setFormData(prev => ({
            ...prev,
            clientName: companyData.company?.name || prev.clientName || '',
            clientEmail: companyData.emails?.[0]?.address || prev.clientEmail || '',
            clientPhone: companyData.phones?.[0] ? `${companyData.phones[0].area}${companyData.phones[0].number}` : prev.clientPhone || '',
            businessActivity: companyData.sideActivities?.[0] ? `${companyData.sideActivities[0].id} | ${companyData.sideActivities[0].text}` : companyData.mainActivity ? `${companyData.mainActivity.id} | ${companyData.mainActivity.text}` : prev.businessActivity || ''
          }));
        }
      }).catch(err => console.error("Error fetching company data:", err));
    }
    
    setImagePreview(preview);
    setActiveTab("data");
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
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
    
    setFormData({
      ...proposal.data,
      creationDate: proposal.data.creationDate || proposal.creationDate,
      validityDate: proposal.data.validityDate || proposal.validityDate,
      specialistName: proposal.data.specialistName || proposal.specialistName || user?.name,
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
  
  const handleDeleteProposal = async (id: string) => {
    const success = await deleteProposal(id);

    // If the deleted proposal was selected, clear the state
    if (success && selectedProposal?.id === id) {
      setSelectedProposal(null);
      setGeneratedProposal(false);
      setFormData({});
      setImagePreview(null);
      setCompanyData(null);
      setActiveTab("upload");
    }
    return success;
  };
  
  const handleReset = () => {
    setFormData({
      clientName: user?.name || '',
      clientEmail: user?.email || '',
      clientPhone: '',
      specialistName: user?.name || '',
      templateId: 'default',
      templateColors: JSON.stringify({
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      }),
      templateLayout: JSON.stringify({
        sections: ['client', 'debt', 'payment', 'fees'],
        showHeader: true,
        showLogo: true,
        showWatermark: false
      })
    });
    setImagePreview(null);
    setGeneratedProposal(false);
    setSelectedProposal(null);
    setCompanyData(null);
    setActiveTab("upload");
  };

  return {
    handleProcessComplete,
    handleInputChange,
    handleGenerateProposal,
    handleViewProposal,
    handleDeleteProposal,
    handleReset
  };
};
