
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download, FileImage, Wand2 } from "lucide-react";
import { AIProposalGenerator } from '@/components/proposals/AIProposalGenerator';

interface ActionButtonsSectionProps {
  onGeneratePdf: () => void;
  onGeneratePng: () => void;
  onPrint: () => void;
  proposalData?: any; // Add proposalData prop
  companyData?: any; // Add companyData prop
}

const ActionButtonsSection = ({ 
  onGeneratePdf, 
  onGeneratePng, 
  onPrint,
  proposalData,
  companyData
}: ActionButtonsSectionProps) => {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Button variant="outline" onClick={onPrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onGeneratePng} 
        className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
      >
        <FileImage className="mr-2 h-4 w-4" />
        Baixar PNG
      </Button>
      
      {proposalData && (
        <AIProposalGenerator 
          proposalData={proposalData}
          companyData={companyData}
          className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
        />
      )}
      
      <Button onClick={onGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
