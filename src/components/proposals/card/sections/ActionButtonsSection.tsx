
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Eye, FileImage } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProposalPreview from "@/components/proposals/card/ProposalPreview";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";

interface ActionButtonsSectionProps {
  onGeneratePdf: () => void;
  onGeneratePng: () => void;
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const ActionButtonsSection = ({ 
  onGeneratePdf, 
  onGeneratePng, 
  data, 
  companyData 
}: ActionButtonsSectionProps) => {
  return (
    <div className="flex justify-center gap-3 mb-6 print:hidden" data-pdf-remove="true">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <ProposalPreview 
            data={data}
            companyData={companyData}
          />
        </DialogContent>
      </Dialog>
      <Button variant="outline" onClick={onGeneratePng} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <FileImage className="mr-2 h-4 w-4" />
        Baixar PNG
      </Button>
      <Button onClick={onGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
