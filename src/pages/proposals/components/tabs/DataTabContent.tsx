
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData } from "@/lib/types/proposals";
import { ClientInfoSection, FinancialInfoSection } from "@/components/proposals/data-form";
import { ArrowRight } from "lucide-react";

interface DataTabContentProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
  setProcessingStatus: (status: string) => void;
}

const DataTabContent = ({
  formData,
  processing,
  onInputChange,
  onGenerateProposal,
  setProcessingStatus
}: DataTabContentProps) => {
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
          />
          
          <FinancialInfoSection
            formData={formData}
            onInputChange={onInputChange}
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
