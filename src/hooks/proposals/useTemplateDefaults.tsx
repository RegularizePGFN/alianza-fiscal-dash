
import { useEffect } from "react";
import { ExtractedData } from "@/lib/types/proposals";

interface UseTemplateDefaultsProps {
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
}

export const useTemplateDefaults = ({
  setFormData
}: UseTemplateDefaultsProps) => {
  
  // Set default template when component mounts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      templateId: 'default',
      templateColors: JSON.stringify({
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      }),
      templateLayout: JSON.stringify({
        sections: ['client', 'debt', 'payment', 'fees'],
        showHeader: true,
        showLogo: true,
        showWatermark: false
      })
    }));
  }, []);
};
