import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
interface ExecutiveDataSectionProps {
  data: Partial<ExtractedData>;
}
const ExecutiveDataSection = ({
  data
}: ExecutiveDataSectionProps) => {
  // Only render if includeExecutiveData is true and we have at least name and email
  if (data.includeExecutiveData !== 'true' || !data.executiveName || !data.executiveEmail) {
    return null;
  }
  return <div className="mt-8 pt-6 border-t border-gray-200 my-0 py-0">
      <div className="text-center space-y-2">
        
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">
            {data.executiveName}
          </p>
          
          <p className="text-sm text-gray-600">
            Especialista Tributário
          </p>
          
          <p className="text-sm text-gray-600">
            {data.executiveEmail}
          </p>
          
          {data.executivePhone && <p className="text-sm text-gray-600">
              {data.executivePhone}
            </p>}
        </div>
      </div>
    </div>;
};
export default ExecutiveDataSection;