
import { useState } from 'react';
import { ExtractedData, CompanyData } from '@/lib/types/proposals';
import { fetchCnpjData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseCnpjSearchProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setProcessingStatus?: (status: string) => void; 
}

export const useCnpjSearch = ({ 
  formData, 
  onInputChange,
  setProcessingStatus 
}: UseCnpjSearchProps) => {
  const [isSearchingCnpj, setIsSearchingCnpj] = useState<boolean>(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const { toast } = useToast();
  
  const handleSearchCnpj = async () => {
    if (!formData.cnpj) {
      toast({
        title: "CNPJ não informado",
        description: "Por favor, digite um CNPJ válido para consulta",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearchingCnpj(true);
    if (setProcessingStatus) {
      setProcessingStatus("Consultando dados do CNPJ...");
    }
    
    try {
      const result = await fetchCnpjData(formData.cnpj);
      
      if (result) {
        setCompanyData(result);
        
        // Update form data with company information
        if (result.company?.name) {
          const event = {
            target: {
              name: 'clientName',
              value: result.company.name
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(event);
        }
        
        // If there's an email, use the first one
        if (result.emails && result.emails.length > 0) {
          const emailEvent = {
            target: {
              name: 'clientEmail',
              value: result.emails[0].address
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(emailEvent);
        }
        
        // If there's a phone, use the first one
        if (result.phones && result.phones.length > 0) {
          const phone = result.phones[0];
          const phoneEvent = {
            target: {
              name: 'clientPhone',
              value: `${phone.area}${phone.number}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(phoneEvent);
        }
        
        // If there's business activity, use the first side activity or main activity
        if (result.sideActivities && result.sideActivities.length > 0) {
          const activity = result.sideActivities[0];
          const activityEvent = {
            target: {
              name: 'businessActivity',
              value: `${activity.id} | ${activity.text}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(activityEvent);
        } else if (result.mainActivity) {
          const activityEvent = {
            target: {
              name: 'businessActivity',
              value: `${result.mainActivity.id} | ${result.mainActivity.text}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(activityEvent);
        }
        
        toast({
          title: "Dados obtidos com sucesso",
          description: `Informações de ${result.company?.name || 'empresa'} preenchidas automaticamente`,
        });
      } else {
        toast({
          title: "CNPJ não encontrado",
          description: "Não foi possível encontrar informações para este CNPJ",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do CNPJ:", error);
      toast({
        title: "Erro na consulta",
        description: "Ocorreu um erro ao consultar os dados do CNPJ",
        variant: "destructive"
      });
    } finally {
      setIsSearchingCnpj(false);
      if (setProcessingStatus) {
        setProcessingStatus("");
      }
    }
  };

  return {
    isSearchingCnpj,
    companyData,
    handleSearchCnpj,
    setCompanyData
  };
};
