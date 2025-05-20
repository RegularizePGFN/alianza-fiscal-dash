
import { useEffect } from "react";
import { ExtractedData } from "@/lib/types/proposals";

interface UseFeesCalculationProps {
  formData: Partial<ExtractedData>;
  setFormData: (formData: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
}

export const useFeesCalculation = ({
  formData,
  setFormData
}: UseFeesCalculationProps) => {
  
  // Calculate fees whenever totalDebt or discountedValue changes
  useEffect(() => {
    if (formData.totalDebt && formData.discountedValue) {
      try {
        const totalDebtValue = parseFloat(formData.totalDebt.replace(/\./g, '').replace(',', '.'));
        const discountedValue = parseFloat(formData.discountedValue.replace(/\./g, '').replace(',', '.'));
        if (!isNaN(totalDebtValue) && !isNaN(discountedValue)) {
          const economyValue = totalDebtValue - discountedValue;
          const feesValue = economyValue * 0.2; // 20% of the savings

          // Format with exactly 2 decimal places
          const formattedValue = feesValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          setFormData(prev => ({
            ...prev,
            feesValue: formattedValue
          }));
        }
      } catch (error) {
        console.error("Error calculating fees:", error);
      }
    }
  }, [formData.totalDebt, formData.discountedValue]);
};
