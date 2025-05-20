
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataFieldProps {
  label: string;
  value: string | ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  highlight?: boolean;
  className?: string;
  textStyle?: string;
  valueStyle?: string;
  textSize?: string;
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
  textStyle = "",
  valueStyle = "",
  textSize = ""
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
      <span className={cn("text-sm font-medium text-gray-500 flex items-center", textStyle, textSize && `text-${textSize}`)}>
        {icon && <span className="h-3 w-3 mr-1">{icon}</span>}
        {label}:
      </span>
      <div className={cn("text-base mt-1", valueStyle, textSize && `text-${textSize}`)}>
        {typeof value === 'string' ? (value || '-') : value}
      </div>
    </div>
  );
};

export default DataField;
