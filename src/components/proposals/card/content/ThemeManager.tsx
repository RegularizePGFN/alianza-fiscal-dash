
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface ThemeManagerProps {
  data: Partial<ExtractedData>;
  children: (colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  }, layout: {
    sections: string[];
    showHeader: boolean;
    showLogo: boolean;
    showWatermark: boolean;
  } | null) => React.ReactNode;
}

const ThemeManager = ({ data, children }: ThemeManagerProps) => {
  // Get colors from template settings or use defaults
  const colors = (() => {
    if (data.templateColors && typeof data.templateColors === 'string') {
      try {
        return JSON.parse(data.templateColors);
      } catch (e) {}
    }
    return {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      background: '#F8FAFC'
    };
  })();

  // Get layout settings or use defaults
  const layoutData = (() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {}
    }
    return null;
  })();

  // Parse layout settings or use defaults
  const layout = {
    sections: layoutData?.sections || ['company', 'alert', 'debt', 'payment', 'fees', 'total'],
    showHeader: layoutData?.showHeader !== undefined ? layoutData.showHeader : true,
    showLogo: layoutData?.showLogo !== undefined ? layoutData.showLogo : true,
    showWatermark: layoutData?.showWatermark || false
  };

  return <>{children(colors, layout)}</>;
};

export default ThemeManager;
