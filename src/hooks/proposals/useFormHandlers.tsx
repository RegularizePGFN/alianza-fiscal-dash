
import { ChangeEvent } from "react";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { fetchCnpjData } from "@/lib/api";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  user,
}: UseFormHandlersProps) => {
  // Store company data in a memoized state to ensure consistency
  let companyContactInfo = {
    clientEmail: '',
    clientPhone: '',
    businessActivity: ''
  };

  // Handle the completion of the image processing
  const handleProcessComplete = (data: Partial<ExtractedData>, preview: string) => {
    // Calculate creation date and validity date
    const now = new Date();
    const validityDate = addDays(now, 1);
    
    // Preserve current company data
    companyContactInfo = {
      clientEmail: formData.clientEmail || '',
      clientPhone: formData.clientPhone || '',
      businessActivity: formData.businessActivity || ''
    };
    
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
      
      // Combine the existing data with new data, preserving company contact info
      return {
        ...prev,
        ...data,
        // Preserve client data if it exists
        clientName: data.clientName || prev.clientName || '',
        clientEmail: prev.clientEmail || companyContactInfo.clientEmail || '',
        clientPhone: prev.clientPhone || companyContactInfo.clientPhone || '',
        businessActivity: prev.businessActivity || companyContactInfo.businessActivity || '',
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
          sections: ['company', 'debt', 'payment', 'fees'],
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
          
          // Update form data with company information from the API
          setFormData(prev => {
            // Store the company contact information in our memory
            const email = companyData.emails?.[0]?.address || '';
            const phone = companyData.phones?.[0] ? `${companyData.phones[0].area}${companyData.phones[0].number}` : '';
            const activity = companyData.mainActivity ? `${companyData.mainActivity.id} | ${companyData.mainActivity.text}` : '';
            
            companyContactInfo = {
              clientEmail: email,
              clientPhone: phone,
              businessActivity: activity
            };
            
            return {
              ...prev,
              clientName: companyData.company?.name || prev.clientName || '',
              // Only update these fields if they're not already set
              clientEmail: email || prev.clientEmail || '',
              clientPhone: phone || prev.clientPhone || '',
              businessActivity: activity || prev.businessActivity || ''
            };
          });
        }
      }).catch(err => console.error("Error fetching company data:", err));
    }
    
    setImagePreview(preview);
    setActiveTab("data");
  };
  
  // Handle form input changes - preserving company contact information
  const handleInputChange = (nameOrEvent: string | ChangeEvent<HTMLInputElement>, value?: string) => {
    // If it's an event (from a form element)
    if (typeof nameOrEvent !== 'string') {
      const { name, value } = nameOrEvent.target;
      
      // Update stored company contact info if relevant
      if (name === 'clientEmail') companyContactInfo.clientEmail = value;
      if (name === 'clientPhone') companyContactInfo.clientPhone = value;
      if (name === 'businessActivity') companyContactInfo.businessActivity = value;
      
      setFormData(prev => {
        // Adjust special behavior for updating entry value or installments
        if (name === 'entryValue' || name === 'entryInstallments') {
          // Update the current field
          const updatedData = {
            ...prev,
            [name]: value
          };
          
          // Try calculating installment value
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
        } else {
          return {
            ...prev,
            [name]: value
          };
        }
      });
    } 
    // If it's a direct name/value pair
    else if (typeof value !== 'undefined') {
      const name = nameOrEvent;
      
      // Update stored company contact info if relevant
      if (name === 'clientEmail') companyContactInfo.clientEmail = value;
      if (name === 'clientPhone') companyContactInfo.clientPhone = value;
      if (name === 'businessActivity') companyContactInfo.businessActivity = value;
      
      setFormData(prev => {
        if (name === 'entryValue' || name === 'entryInstallments') {
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
        } else {
          return {
            ...prev,
            [name]: value
          };
        }
      });
    }
  };

  return {
    handleProcessComplete,
    handleInputChange
  };
};
