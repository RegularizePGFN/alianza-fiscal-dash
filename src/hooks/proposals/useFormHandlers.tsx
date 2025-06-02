
import { useState, useEffect, ChangeEvent } from "react";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { fetchCnpjData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UseFormHandlersProps {
  formData: Partial<ExtractedData>;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
  setImagePreview: (preview: string | null) => void;
  setActiveTab: (tab: string) => void;
  setCompanyData: (data: CompanyData | null) => void;
  user: any;
}

export const useFormHandlers = ({
  formData,
  setFormData,
  setImagePreview,
  setActiveTab,
  setCompanyData,
  user
}: UseFormHandlersProps) => {
  const { toast } = useToast();
  const [debouncedCnpj, setDebouncedCnpj] = useState<string>("");
  
  // Handle CNPJ change with debounce
  useEffect(() => {
    if (debouncedCnpj && debouncedCnpj.length >= 14) {
      const loadCompanyData = async () => {
        try {
          const data = await fetchCnpjData(debouncedCnpj);
          if (data) {
            setCompanyData(data);
            
            // IMPORTANTE: Preencher APENAS os dados da empresa, NUNCA do vendedor
            setFormData((prev) => ({
              ...prev,
              clientName: data.company?.name || prev.clientName || '',
              clientEmail: data.emails?.[0]?.address || prev.clientEmail || '',
              clientPhone: data.phones?.[0] ? `${data.phones[0].area}${data.phones[0].number}` : prev.clientPhone || '',
              businessActivity: data.sideActivities?.[0] ? `${data.sideActivities[0].id} | ${data.sideActivities[0].text}` : data.mainActivity ? `${data.mainActivity.id} | ${data.mainActivity.text}` : prev.businessActivity || ''
            }));
            
            toast({
              title: "Dados da empresa obtidos",
              description: `Informações de ${data.company?.name} preenchidas automaticamente.`
            });
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
        }
      };
      
      loadCompanyData();
    }
  }, [debouncedCnpj, setCompanyData, setFormData, toast]);
  
  // Handle OCR completion and data extraction
  const handleProcessComplete = (extractedData: Partial<ExtractedData>, imagePreview: string) => {
    setFormData((prevData) => ({
      ...prevData,
      ...extractedData,
      // IMPORTANTE: Manter apenas o nome do especialista do usuário logado, não sobrescrever dados do cliente
      specialistName: user?.name || extractedData.specialistName || '',
    }));
    
    setImagePreview(imagePreview);
    
    // If CNPJ is available, set it for debounced fetching
    if (extractedData.cnpj) {
      setDebouncedCnpj(extractedData.cnpj);
    }
    
    toast({
      title: "Processamento concluído",
      description: "Todos os dados foram extraídos com sucesso!"
    });
    
    // Navigate to the data tab
    setActiveTab("data");
  };
  
  // Handle form input changes
  const handleInputChange = (nameOrEvent: string | ChangeEvent<HTMLInputElement>, value?: string) => {
    if (typeof nameOrEvent === 'string') {
      // Handle string name and explicit value (for non-event cases)
      const name = nameOrEvent;
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      
      // Special handling for CNPJ to fetch company data automatically
      if (name === 'cnpj' && value && value.length >= 14) {
        setDebouncedCnpj(value);
      }
    } else {
      // Handle event object
      const { name, value } = nameOrEvent.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      
      // Special handling for CNPJ to fetch company data automatically
      if (name === 'cnpj' && value.length >= 14) {
        setDebouncedCnpj(value);
      }
    }
  };
  
  return {
    handleProcessComplete,
    handleInputChange,
  };
};
