
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: ReactNode;
  title: string;
  icon?: React.ReactNode;
  className?: string;
  color?: string;
  fullWidth?: boolean;
  subtitle?: string;
}

/**
 * A responsive container for proposal sections
 */
const SectionContainer = ({ 
  children, 
  title, 
  icon, 
  className, 
  color = '#1E40AF',
  fullWidth = false,
  subtitle
}: SectionContainerProps) => {
  return (
    <div className={cn("mb-5 print:break-inside-avoid", className)}>
      <h3 
        className="text-base font-semibold pb-1.5 mb-2 border-b border-gray-200 flex items-center" 
        style={{ color }}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-600 mb-2.5 italic">{subtitle}</p>
      )}
      <div className={`grid grid-cols-1 ${fullWidth ? '' : 'md:grid-cols-2'} gap-3`}>
        {children}
      </div>
    </div>
  );
};

export default SectionContainer;
