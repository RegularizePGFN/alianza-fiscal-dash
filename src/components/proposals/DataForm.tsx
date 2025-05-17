
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ExtractedData } from '@/lib/types/proposals';
import { 
  ClientInfoSection, 
  FinancialInfoSection, 
  CompanyDetailsPanel, 
  ProcessingIndicator 
} from './data-form';
import { useCnpjSearch } from './data-form/useCnpjSearch';

interface DataFormProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
}

const DataForm = ({ formData, processing, onInputChange, onGenerateProposal }: DataFormProps) => {
  const { 
    isSearchingCnpj, 
    companyData, 
    handleSearchCnpj, 
    setCompanyData 
  } = useCnpjSearch({ formData, onInputChange });
  
  // Auto-search CNPJ when the component loads and CNPJ is available
  useEffect(() => {
    if (formData.cnpj && !companyData && !isSearchingCnpj) {
      handleSearchCnpj();
    }
  }, [formData.cnpj]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Dados da Proposta</CardTitle>
      </CardHeader>
      <CardContent>
        {processing ? (
          <ProcessingIndicator processing={processing} />
        ) : (
          <div className="grid gap-6">
            <CompanyDetailsPanel companyData={companyData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClientInfoSection
                formData={formData}
                onInputChange={onInputChange}
                isSearchingCnpj={isSearchingCnpj}
                handleSearchCnpj={handleSearchCnpj}
                companyData={companyData}
              />
              
              <FinancialInfoSection 
                formData={formData} 
                onInputChange={onInputChange} 
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button onClick={onGenerateProposal} disabled={processing || !formData.cnpj} variant="default">
          <FileText className="mr-2 h-4 w-4" />
          Gerar Proposta
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataForm;
