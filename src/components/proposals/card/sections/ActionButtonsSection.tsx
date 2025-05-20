
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface ActionButtonsSectionProps {
  onGeneratePdf: () => void;
  onPrint: () => void;
}

const ActionButtonsSection = ({ onGeneratePdf, onPrint }: ActionButtonsSectionProps) => {
  return (
    <div className="pt-4 flex justify-end gap-3">
      <Button variant="outline" onClick={onPrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button onClick={onGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
