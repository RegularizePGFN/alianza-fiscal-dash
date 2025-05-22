
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: ReactNode;
  title: string;
  icon?: React.ReactNode; // Keeping the prop for backward compatibility
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
  icon, // We'll keep the prop but not use it
  className, 
  color = '#1E40AF',
  fullWidth = false,
  subtitle
}: SectionContainerProps) => {
  return (
    <div className={cn("mb-3 print:break-inside-avoid", className)}>
      <h3 
        className="text-base font-semibold pb-1 mb-1.5 border-b border-gray-200 flex items-center" 
        style={{ color }}
      >
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-gray-600 mb-1.5 italic">{subtitle}</p>
      )}
      <div className={`grid grid-cols-1 ${fullWidth ? '' : 'md:grid-cols-2'} gap-2`}>
        {children}
      </div>
    </div>
  );
};

export default SectionContainer;
