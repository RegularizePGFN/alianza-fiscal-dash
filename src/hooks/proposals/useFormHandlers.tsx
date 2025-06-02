
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
  
  // Automatic CNPJ data fetching with debounce
  useEffect(() => {
    if (debouncedCnpj && debouncedCnpj.length >= 14) {
      const loadCompanyData = async () => {
        try {
          console.log("Fetching CNPJ data automatically for:", debouncedCnpj);
          const data = await fetchCnpjData(debouncedCnpj);
          if (data) {
            console.log("CNPJ data received:", data);
            setCompanyData(data);
            
            // Update ONLY client-related fields with company data
            setFormData(prev => ({
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
    console.log("Processing complete with extracted data:", extractedData);
    
    // CRITICAL: Only set specialist name from user, never overwrite client data
    setFormData((prevData) => ({
      ...prevData,
      ...extractedData,
      // Ensure specialist name comes from user, not extracted data
      specialistName: user?.name || '',
      // Preserve any existing client data and don't overwrite with user data
      clientName: extractedData.clientName || prevData.clientName || '',
      clientEmail: extractedData.clientEmail || prevData.clientEmail || '',
      clientPhone: extractedData.clientPhone || prevData.clientPhone || '',
    }));
    
    setImagePreview(imagePreview);
    
    // If CNPJ is available, automatically fetch company data
    if (extractedData.cnpj) {
      console.log("Setting CNPJ for automatic fetch:", extractedData.cnpj);
      setDebouncedCnpj(extractedData.cnpj);
    }
    
    toast({
      title: "Processamento concluído",
      description: "Dados extraídos com sucesso! Buscando informações da empresa..."
    });
    
    // Navigate to the data tab
    setActiveTab("data");
  };
  
  // Handle form input changes
  const handleInputChange = (nameOrEvent: string | ChangeEvent<HTMLInputElement>, value?: string) => {
    if (typeof nameOrEvent === 'string') {
      const name = nameOrEvent;
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      
      // Special handling for CNPJ to fetch company data automatically
      if (name === 'cnpj' && value && value.length >= 14) {
        console.log("CNPJ changed, triggering automatic fetch:", value);
        setDebouncedCnpj(value);
      }
    } else {
      const { name, value } = nameOrEvent.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      
      // Special handling for CNPJ to fetch company data automatically
      if (name === 'cnpj' && value.length >= 14) {
        console.log("CNPJ changed via event, triggering automatic fetch:", value);
        setDebouncedCnpj(value);
      }
    }
  };
  
  return {
    handleProcessComplete,
    handleInputChange,
  };
};
