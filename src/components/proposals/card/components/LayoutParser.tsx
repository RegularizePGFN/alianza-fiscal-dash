
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface LayoutParserProps {
  data: Partial<ExtractedData>;
}

/**
 * Parses template layout and color settings from proposal data
 */
const LayoutParser = ({ data }: LayoutParserProps) => {
  // Get colors from template settings or use defaults
  const colors = React.useMemo(() => {
    if (data.templateColors && typeof data.templateColors === 'string') {
      try {
        return JSON.parse(data.templateColors);
      } catch (e) {
        console.error('Error parsing template colors:', e);
      }
    }
    return {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      background: '#F8FAFC'
    };
  }, [data.templateColors]);

  // Get layout settings or use defaults
  const layoutData = React.useMemo(() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {
        console.error('Error parsing template layout:', e);
      }
    }
    return null;
  }, [data.templateLayout]);

  // Parse layout settings or use defaults
  const layout = React.useMemo(() => ({
    sections: layoutData?.sections || ['company', 'debt', 'payment', 'fees'],
    showHeader: layoutData?.showHeader !== undefined ? layoutData.showHeader : true,
    showLogo: layoutData?.showLogo !== undefined ? layoutData.showLogo : true,
    showWatermark: layoutData?.showWatermark || false
  }), [layoutData]);

  return { colors, layout };
};

export default LayoutParser;
