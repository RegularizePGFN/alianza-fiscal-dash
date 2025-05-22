
import { useEffect } from 'react';
import { ExtractedData } from '@/lib/types/proposals';

interface UseFeesCalculationProps {
  formData: Partial<ExtractedData>;
  setFormData: (data: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
}

export const useFeesCalculation = ({ formData, setFormData }: UseFeesCalculationProps) => {
  // Calculate fees when total debt or discounted value changes
  useEffect(() => {
    if (formData.totalDebt && formData.discountedValue) {
      calculateFees();
    }
  }, [formData.totalDebt, formData.discountedValue]);
  
  // Calculate installment fees when feesValue or installment fees parameters change
  useEffect(() => {
    if (formData.feesValue && 
        formData.feesInstallments && 
        formData.feesAdditionalPercentage) {
      calculateInstallmentFees();
    }
  }, [formData.feesValue, formData.feesInstallments, formData.feesAdditionalPercentage, formData.showFeesInstallments]);

  // Function to calculate upfront fees (20% of savings)
  const calculateFees = () => {
    try {
      if (!formData.totalDebt || !formData.discountedValue) return;
      
      // Convert string values to numbers
      const totalDebt = parseFloat(formData.totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedValue = parseFloat(formData.discountedValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(totalDebt) || isNaN(discountedValue)) {
        return;
      }
      
      // Calculate 20% of savings
      const savingsAmount = totalDebt - discountedValue;
      const feesValue = savingsAmount * 0.2;
      
      // Format the result with Brazilian currency format
      const formattedFees = feesValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Update formData
      setFormData(prev => ({
        ...prev,
        feesValue: formattedFees,
      }));
      
      // Also calculate installment fees if needed
      if (formData.feesInstallments && formData.feesAdditionalPercentage) {
        calculateInstallmentFees();
      }
      
    } catch (error) {
      console.error('Error calculating fees:', error);
    }
  };
  
  // Function to calculate installment fees
  const calculateInstallmentFees = () => {
    try {
      if (!formData.feesValue || !formData.feesAdditionalPercentage || !formData.feesInstallments) return;
      
      // Convert string values to numbers
      const baseFeesValue = parseFloat(formData.feesValue.replace(/\./g, '').replace(',', '.'));
      const additionalPercentage = parseFloat(formData.feesAdditionalPercentage) / 100;
      const installments = parseInt(formData.feesInstallments);
      
      if (isNaN(baseFeesValue) || isNaN(additionalPercentage) || isNaN(installments)) {
        return;
      }
      
      // Apply additional percentage to base fees
      const totalFeesValue = baseFeesValue * (1 + additionalPercentage);
      
      // Calculate installment value
      const installmentValue = totalFeesValue / installments;
      
      // Format the results with Brazilian currency format
      const formattedTotalFees = totalFeesValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      const formattedInstallmentFees = installmentValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Update formData
      setFormData(prev => ({
        ...prev,
        feesInstallmentValue: formattedInstallmentFees,
        feesTotalInstallmentValue: formattedTotalFees
      }));
      
    } catch (error) {
      console.error('Error calculating installment fees:', error);
    }
  };

  return {
    calculateFees,
    calculateInstallmentFees
  };
};
