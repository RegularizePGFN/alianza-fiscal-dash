
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataFieldProps {
  label: string;
  value: string | ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  highlight?: boolean;
  className?: string;
  description?: string;
  additionalText?: string;
}

/**
 * Reusable data field component for proposal sections
 */
const DataField = ({
  label,
  value,
  icon,
  fullWidth = false,
  highlight = false,
  className,
  description,
  additionalText
}: DataFieldProps) => {
  return (
    <div 
      className={cn(
        "bg-gray-50 p-3 rounded", 
        fullWidth && "md:col-span-2",
        highlight && "bg-gradient-to-br from-green-50 to-white",
        className
      )}
    >
      <span className="text-sm font-medium text-gray-500 flex items-center">
        {icon && <span className="h-3 w-3 mr-1">{icon}</span>}
        {label}:
      </span>
      <div className="text-base mt-1">
        {typeof value === 'string' ? (value || '-') : value}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1 italic">{description}</p>
      )}
      {additionalText && (
        <p className="text-xs text-gray-600 mt-1 font-medium">{additionalText}</p>
      )}
    </div>
  );
};

export default DataField;
