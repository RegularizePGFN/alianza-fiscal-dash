
import { useState } from 'react';
import { ExtractedData, CompanyData } from '@/lib/types/proposals';
import { fetchCnpjData } from '@/lib/api';

interface UseCnpjSearchProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useCnpjSearch = ({ formData, onInputChange }: UseCnpjSearchProps) => {
  const [isSearchingCnpj, setIsSearchingCnpj] = useState<boolean>(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  
  const handleSearchCnpj = async () => {
    if (!formData.cnpj) return;
    
    setIsSearchingCnpj(true);
    
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
      }
    } catch (error) {
      console.error("Erro ao buscar dados do CNPJ:", error);
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  return {
    isSearchingCnpj,
    companyData,
    handleSearchCnpj,
    setCompanyData
  };
};
