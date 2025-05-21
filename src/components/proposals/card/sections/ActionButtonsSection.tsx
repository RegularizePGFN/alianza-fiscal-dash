
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, FileImage, FileUp, FileIcon } from "lucide-react";

interface ActionButtonsSectionProps {
  onGeneratePdf: () => void;
  onGeneratePng: () => void;
  onPrint: () => void;
  onGenerateHighQuality?: () => void;
  isGeneratingHighQuality?: boolean;
  className?: string; // Added className prop for flexible positioning
}

const ActionButtonsSection = ({ 
  onGeneratePdf, 
  onGeneratePng, 
  onPrint, 
  onGenerateHighQuality,
  isGeneratingHighQuality = false,
  className = ""
}: ActionButtonsSectionProps) => {
  return (
    <div className={`pt-4 flex flex-col md:flex-row gap-3 px-6 pb-6 justify-end ${className}`}>
      <Button variant="outline" onClick={onPrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      
      <Button variant="outline" onClick={onGeneratePng} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <FileImage className="mr-2 h-4 w-4" />
        Baixar PNG
      </Button>
      
      {onGenerateHighQuality && (
        <Button 
          variant="outline" 
          onClick={onGenerateHighQuality} 
          disabled={isGeneratingHighQuality}
          className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
        >
          <FileUp className={`mr-2 h-4 w-4 ${isGeneratingHighQuality ? 'animate-pulse' : ''}`} />
          {isGeneratingHighQuality ? 'Processando...' : 'PNG Alta Qualidade'}
        </Button>
      )}
      
      <Button onClick={onGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
        <FileIcon className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
