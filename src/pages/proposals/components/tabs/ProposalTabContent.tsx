
import React from 'react';
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { ProposalCard } from "@/components/proposals/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ProposalTabContentProps {
  formData: Partial<ExtractedData>;
  imagePreview: string | null;
  companyData?: CompanyData | null;
  onReset: () => void;
}

const ProposalTabContent = ({
  formData,
  imagePreview,
  companyData,
  onReset
}: ProposalTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Nova Proposta
        </Button>
      </div>
      
      <ProposalCard
        data={formData}
        imageUrl={imagePreview || undefined}
        companyData={companyData}
      />
    </div>
  );
};

export default ProposalTabContent;
