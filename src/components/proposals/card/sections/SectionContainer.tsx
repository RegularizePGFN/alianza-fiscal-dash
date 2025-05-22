
import React, { ReactNode } from 'react';

interface SectionContainerProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  color?: string;
  className?: string;
  extraHeaderContent?: ReactNode;
  fullWidth?: boolean;
}

const SectionContainer = ({
  title,
  children,
  icon,
  color = '#1E40AF',
  className = '',
  extraHeaderContent,
  fullWidth = false
}: SectionContainerProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between items-center border-b pb-1 mb-3" style={{ borderColor: `${color}30` }}>
        <h3 
          className="font-medium flex items-center gap-1.5" 
          style={{ color }}
        >
          {icon}
          {title}
        </h3>
        {extraHeaderContent && (
          <div className={`flex items-center ${fullWidth ? 'flex-1 justify-end' : ''}`}>
            {extraHeaderContent}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default SectionContainer;
