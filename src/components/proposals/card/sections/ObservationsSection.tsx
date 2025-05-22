import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
interface ObservationsSectionProps {
  data: Partial<ExtractedData>;
}
const ObservationsSection = ({
  data
}: ObservationsSectionProps) => {
  if (!data.additionalComments) return null;
  return <div className="space-y-1">
      <h3 className="font-semibold text-sm border-b border-af-blue-200 pb-0.5 text-af-blue-800 py-[5px] my-[10px]">
        Observações
      </h3>
      <div className="rounded-lg">
        <p className="text-xs text-gray-700 whitespace-pre-wrap">{data.additionalComments}</p>
      </div>
    </div>;
};
export default ObservationsSection;