
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface ObservationsSectionProps {
  data: Partial<ExtractedData>;
}

const ObservationsSection = ({ data }: ObservationsSectionProps) => {
  if (!data.additionalComments) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800">
        Observações
      </h3>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-gray-700 whitespace-pre-wrap">{data.additionalComments}</p>
      </div>
    </div>
  );
};

export default ObservationsSection;
