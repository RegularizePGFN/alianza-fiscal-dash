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
      
      // MODIFICAÇÃO IMPORTANTE: Manter dados do cliente existentes, mas NÃO usar o nome do usuário como razão social
      return {
        ...prev,
        ...data,
        // Manter clientName apenas se já existir, caso contrário usar o dado da imagem processada
        clientName: prev.clientName || data.clientName || '',
        clientEmail: prev.clientEmail || data.clientEmail || user?.email || '',
        clientPhone: prev.clientPhone || data.clientPhone || '',
        businessActivity: prev.businessActivity || data.businessActivity || '',
        feesValue: feesValue || prev.feesValue || '0,00',
        // Make sure entryInstallments is set, defaulting to '1' if not provided
        entryInstallments: data.entryInstallments || prev.entryInstallments || '1',
        // Set specialist name using user's name
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
          // Importante: Usar o nome da empresa dos dados do CNPJ como razão social
          setFormData(prev => {
            return {
              ...prev,
              // Usar o nome da empresa como clientName
              clientName: companyData.company?.name || prev.clientName || '',
              clientEmail: prev.clientEmail || companyData.emails?.[0]?.address || '',
              clientPhone: prev.clientPhone || (companyData.phones?.[0] ? `${companyData.phones[0].area}${companyData.phones[0].number}` : ''),
              businessActivity: prev.businessActivity || (companyData.sideActivities?.[0] ? 
                `${companyData.sideActivities[0].id} | ${companyData.sideActivities[0].text}` : 
                companyData.mainActivity ? `${companyData.mainActivity.id} | ${companyData.mainActivity.text}` : '')
            };
          });
        }
      }).catch(err => console.error("Error fetching company data:", err));
    }
    
    setImagePreview(preview);
    setActiveTab("data");
  };
  
  // Updated to handle both direct name/value and event-based changes
  const handleInputChange = (nameOrEvent: string | ChangeEvent<HTMLInputElement>, value?: string) => {
    // If it's an event (from a form element)
    if (typeof nameOrEvent !== 'string') {
      const { name, value } = nameOrEvent.target;
      
      // Ajuste especial para atualizar o valor da parcela de entrada quando a entrada ou número de parcelas mudar
      if (name === 'entryValue' || name === 'entryInstallments') {
        setFormData(prev => {
          // Atualizar o campo atual
          const updatedData = {
            ...prev,
            [name]: value
          };
          
          // Tentar recalcular o valor da parcela
          try {
            if (name === 'entryValue' && prev.entryInstallments || 
                name === 'entryInstallments' && prev.entryValue) {
              
              const entryValue = name === 'entryValue' 
                ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
                : parseFloat(prev.entryValue?.replace(/\./g, '').replace(',', '.') || '0');
              
              const installments = name === 'entryInstallments'
                ? parseInt(value)
                : parseInt(prev.entryInstallments || '1');
                
              if (!isNaN(entryValue) && !isNaN(installments) && installments > 0) {
                // Esta parte apenas calcula, mas não atualiza nenhum campo específico,
                // pois o cálculo é feito sob demanda nos componentes
                console.log(`Valor calculado: ${(entryValue / installments).toLocaleString('pt-BR')}`);
              }
            }
          } catch (e) {
            console.error("Erro ao calcular valor da parcela:", e);
          }
          
          return updatedData;
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } 
    // If it's a direct name/value pair (as used in PDFEditorTabContent)
    else if (typeof value !== 'undefined') {
      const name = nameOrEvent;
      
      // Similar ao tratamento acima, mas para o caso de uso direto de nome/valor
      if (name === 'entryValue' || name === 'entryInstallments') {
        setFormData(prev => {
          const updatedData = {
            ...prev,
            [name]: value
          };
          
          try {
            if (name === 'entryValue' && prev.entryInstallments || 
                name === 'entryInstallments' && prev.entryValue) {
              
              const entryValue = name === 'entryValue' 
                ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
                : parseFloat(prev.entryValue?.replace(/\./g, '').replace(',', '.') || '0');
              
              const installments = name === 'entryInstallments'
                ? parseInt(value)
                : parseInt(prev.entryInstallments || '1');
                
              if (!isNaN(entryValue) && !isNaN(installments) && installments > 0) {
                console.log(`Valor calculado: ${(entryValue / installments).toLocaleString('pt-BR')}`);
              }
            }
          } catch (e) {
            console.error("Erro ao calcular valor da parcela:", e);
          }
          
          return updatedData;
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
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
      // Não usar o nome do usuário para clientName
      clientName: '',
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
    handleInputChange: typeof handleInputChange !== 'undefined' ? handleInputChange : () => {},
    handleGenerateProposal: typeof handleGenerateProposal !== 'undefined' ? handleGenerateProposal : () => {},
    handleViewProposal: typeof handleViewProposal !== 'undefined' ? handleViewProposal : () => {},
    handleDeleteProposal: typeof handleDeleteProposal !== 'undefined' ? handleDeleteProposal : () => {},
    handleReset
  };
};
