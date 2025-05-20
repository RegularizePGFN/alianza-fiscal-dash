
import { useEffect } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExtractedData } from "@/lib/types/proposals";

interface UseDatesHandlingProps {
  activeTab: string;
  formData: Partial<ExtractedData>;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
}

export const useDatesHandling = ({
  activeTab,
  formData,
  setFormData
}: UseDatesHandlingProps) => {
  
  // Set creation and validity dates when generating proposal
  useEffect(() => {
    if (activeTab === "pdf-editor" && !formData.creationDate) {
      const now = new Date();
      const validityDate = addDays(now, 1);
      
      setFormData(prev => ({
        ...prev,
        creationDate: format(now, "yyyy-MM-dd'T'HH:mm:ss", { locale: ptBR }),
        validityDate: format(validityDate, "yyyy-MM-dd'T'HH:mm:ss", { locale: ptBR })
      }));
    }
  }, [activeTab, formData.creationDate]);
};
