
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
  const [isSearchingCnpj] = useState<boolean>(false); // Always false since we don't have manual search
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const { toast } = useToast();
  
  // This function is kept for compatibility but does nothing since search is automatic
  const handleSearchCnpj = async () => {
    toast({
      title: "Busca automática ativa",
      description: "Os dados do CNPJ são buscados automaticamente quando você digita um CNPJ válido",
    });
  };

  return {
    isSearchingCnpj,
    companyData,
    handleSearchCnpj,
    setCompanyData
  };
};
