
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: ReactNode;
  title: string;
  icon?: React.ReactNode;
  className?: string;
  color?: string;
  fullWidth?: boolean;
  compact?: boolean;
}

/**
 * A responsive container for proposal sections with compact option for PDF
 */
const SectionContainer = ({ 
  children, 
  title, 
  icon, 
  className, 
  color = '#1E40AF',
  fullWidth = false,
  compact = false
}: SectionContainerProps) => {
  return (
    <div className={cn("mb-6", compact ? "mb-3" : "mb-6", className)}>
      <h3 
        className={cn(
          "text-base font-semibold border-b border-gray-200 flex items-center",
          compact ? "pb-1 mb-2" : "pb-2 mb-3"
        )}
        style={{ color }}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <div className={`grid grid-cols-1 ${fullWidth ? '' : 'md:grid-cols-2'} ${compact ? 'gap-2' : 'gap-4'}`}>
        {children}
      </div>
    </div>
  );
};

export default SectionContainer;
