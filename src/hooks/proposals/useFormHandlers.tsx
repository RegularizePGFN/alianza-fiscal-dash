
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
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
        }
      };
      
      loadCompanyData();
    }
  }, [debouncedCnpj, setCompanyData]);
  
  // Handle OCR completion and data extraction
  const handleProcessComplete = (extractedData: Partial<ExtractedData>, imagePreview: string) => {
    console.log('handleProcessComplete called with:', extractedData);
    
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        ...extractedData,
        specialistName: user?.name || extractedData.specialistName || '',
      };
      console.log('Form data updated to:', updatedData);
      return updatedData;
    });
    
    setImagePreview(imagePreview);
    
    // If CNPJ is available, set it for debounced fetching
    if (extractedData.cnpj) {
      setDebouncedCnpj(extractedData.cnpj);
    }
    
    toast({
      title: "Processamento concluído",
      description: "Dados extraídos da imagem com sucesso!"
    });
    
    // Navigate to the data tab after a brief delay to ensure state updates
    setTimeout(() => {
      console.log('Switching to data tab');
      setActiveTab("data");
    }, 100);
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
      
      // Special handling for CNPJ to fetch company data
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
      
      // Special handling for CNPJ to fetch company data
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
