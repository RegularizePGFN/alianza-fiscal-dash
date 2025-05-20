
import React, { ReactNode } from 'react';

interface SectionContainerProps {
  title: string;
  children: ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  className?: string;
}

const SectionContainer = ({
  title,
  children,
  colors,
  className = "",
}: SectionContainerProps) => {
  return (
    <div className={`border rounded-md overflow-hidden mb-3 ${className}`}>
      <div className="px-3 py-1 font-medium text-sm" style={{ backgroundColor: colors.primary, color: 'white' }}>
        {title}
      </div>
      <div className="px-3 py-2">
        {children}
      </div>
    </div>
  );
};

export default SectionContainer;
