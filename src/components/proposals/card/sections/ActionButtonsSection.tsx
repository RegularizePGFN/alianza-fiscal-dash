
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, FileImage } from "lucide-react";

interface ActionButtonsSectionProps {
  onGeneratePdf: () => void;
  onGeneratePng: () => void;
  onPrint: () => void;
}

const ActionButtonsSection = ({ onGeneratePdf, onGeneratePng, onPrint }: ActionButtonsSectionProps) => {
  return (
    <div className="pt-4 flex justify-end gap-3 px-6 pb-6">
      <Button variant="outline" onClick={onPrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
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
