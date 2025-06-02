
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { ClientInfoSection, FinancialInfoSection } from "@/components/proposals/data-form";
import { ArrowRight } from "lucide-react";
import { useCnpjSearch } from "@/components/proposals/data-form/useCnpjSearch";

interface DataTabContentProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
  setProcessingStatus: (status: string) => void;
  companyData?: CompanyData | null;
  searchCnpj?: (cnpj: string) => void;
  isSearchingCnpj?: boolean;
}

const DataTabContent = ({
  formData,
  processing,
  onInputChange,
  onGenerateProposal,
  setProcessingStatus,
  companyData,
  searchCnpj,
  isSearchingCnpj = false
}: DataTabContentProps) => {
  // Use the CNPJ search hook for manual search functionality
  const {
    isSearchingCnpj: hookIsSearching,
    companyData: hookCompanyData,
    handleSearchCnpj
  } = useCnpjSearch({ 
    formData, 
    onInputChange,
    setProcessingStatus
  });

  // Use props if available, otherwise use hook values
  const finalIsSearching = isSearchingCnpj || hookIsSearching;
  const finalCompanyData = companyData || hookCompanyData;
  const finalHandleSearch = searchCnpj ? () => searchCnpj(formData.cnpj || '') : handleSearchCnpj;

  // Calculate entry installment value
  const calculateEntryInstallmentValue = () => {
    if (formData.entryValue && formData.entryInstallments) {
      try {
        // Entry value is already per installment, so just return it
        return formData.entryValue;
      } catch (error) {
        console.error("Erro ao calcular o valor da parcela de entrada:", error);
      }
    }
    return "0,00";
  };
  
  useEffect(() => {
    setProcessingStatus("Dados extraídos com sucesso!");
  }, [setProcessingStatus]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <ClientInfoSection
            formData={formData}
            onInputChange={onInputChange}
            isSearchingCnpj={finalIsSearching}
            handleSearchCnpj={finalHandleSearch}
            companyData={finalCompanyData}
          />
          
          <FinancialInfoSection
            formData={formData}
            onInputChange={onInputChange}
            disabled={false}
            entryInstallmentValue={calculateEntryInstallmentValue()}
          />
          
          <div className="flex justify-end mt-6">
            <Button 
              className="flex items-center gap-2"
              onClick={onGenerateProposal} 
              disabled={processing}
            >
              Gerar Proposta
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataTabContent;
