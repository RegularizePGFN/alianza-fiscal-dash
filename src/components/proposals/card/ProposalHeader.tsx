
import React from 'react';
import { CardHeader } from "@/components/ui/card";
import { FileText, Percent } from "lucide-react";

interface ProposalHeaderProps {
  discountedValue: string;
}

const ProposalHeader = ({ discountedValue }: ProposalHeaderProps) => {
  return (
    <CardHeader className="bg-af-blue-700 text-white pb-8 print:bg-af-blue-700">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
            alt="Logo" 
            className="h-14 w-auto"
          />
          <h2 className="text-2xl font-bold text-white">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 flex-shrink-0" />
              Proposta de Parcelamento PGFN
            </div>
          </h2>
        </div>
        <div className="bg-af-green-500 text-white text-sm py-1.5 px-3 flex items-center">
          <Percent className="h-4 w-4 mr-2 flex-shrink-0" /> 
          Economia de R$ {discountedValue || '0,00'}
        </div>
      </div>
    </CardHeader>
  );
};

export default ProposalHeader;
