import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";

interface ActionButtonsSectionProps {
  onGeneratePdf: () => void;
  onGeneratePng?: () => void;
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const ActionButtonsSection = ({ onGeneratePdf }: ActionButtonsSectionProps) => {
  return (
    <div
      className="flex flex-col sm:flex-row gap-2 justify-center"
      data-pdf-remove="true"
    >
      <Button onClick={onGeneratePdf} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Baixar em PDF
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
