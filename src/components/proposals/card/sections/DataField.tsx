
import React from 'react';

export interface DataFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
  description?: string;
  additionalText?: string;
}

const DataField: React.FC<DataFieldProps> = ({ 
  label, 
  value, 
  highlight = false, 
  className = "", 
  description = "",
  additionalText = ""
}) => {
  return (
    <div className={`py-2 ${className}`}>
      <div className="text-xs text-af-dark-500">{label}</div>
      <div className={`text-af-dark-800 ${highlight ? 'text-lg font-bold' : 'text-sm'}`}>
        {value}
        {additionalText && <span className="text-xs ml-1 text-gray-500">{additionalText}</span>}
      </div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
  );
};

export default DataField;
