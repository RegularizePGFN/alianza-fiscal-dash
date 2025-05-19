
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface TotalSectionProps {
  data: Partial<ExtractedData>;
}

const TotalSection = ({ data }: TotalSectionProps) => {
  return (
    <div className="mb-6 bg-gray-800 p-4 rounded-lg text-white shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-medium mb-1">
            Valor Total:
          </h3>
          <p className="text-sm opacity-80">Com reduções aplicáveis</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-medium">
            R$ {data.discountedValue || '0,00'}
          </p>
          <div className="flex items-center justify-end text-green-300 mt-1 text-sm">
            <span>Economia de {data.discountPercentage || '0'}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalSection;
