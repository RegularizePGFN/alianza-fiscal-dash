
import React, { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface DataFieldProps {
  label: string;
  value: string | ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  highlight?: boolean;
  className?: string;
  compact?: boolean;
  style?: CSSProperties;
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
  compact = false,
  style
}: DataFieldProps) => {
  return (
    <div 
      className={cn(
        "bg-gray-50 rounded", 
        compact ? "p-2" : "p-3",
        fullWidth && "md:col-span-2",
        highlight && "bg-gradient-to-br from-green-50 to-white",
        className
      )}
      style={style}
    >
      <span className={cn("font-medium text-gray-500 flex items-center", compact ? "text-xs" : "text-sm")}>
        {icon && <span className={cn("mr-1", compact ? "h-2.5 w-2.5" : "h-3 w-3")}>{icon}</span>}
        {label}:
      </span>
      <div className={cn("mt-1", compact ? "text-sm" : "text-base")}>
        {typeof value === 'string' ? (value || '-') : value}
      </div>
    </div>
  );
};

export default DataField;
