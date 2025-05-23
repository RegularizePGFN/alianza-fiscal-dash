
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
  
  // Watch for changes in showFeesInstallments to set default values and calculate
  useEffect(() => {
    if (formData.showFeesInstallments === 'true') {
      // Set default values if they're not already set
      setFormData(prev => ({
        ...prev,
        feesInstallments: prev.feesInstallments || '2',
        feesPaymentMethod: prev.feesPaymentMethod || 'cartao'
      }));
      
      // Calculate the installment total value with 20% increase if we have a base fees value
      if (formData.feesValue) {
        calculateInstallmentFeesTotal();
      }
    }
  }, [formData.showFeesInstallments, formData.feesValue]);

  // Recalculate when total installment value or number of installments changes
  useEffect(() => {
    if (formData.showFeesInstallments === 'true' && 
        formData.feesTotalInstallmentValue && 
        formData.feesInstallments) {
      calculateInstallmentValue();
    }
  }, [formData.feesTotalInstallmentValue, formData.feesInstallments]);

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
      
      // If installment fees are enabled, also calculate the installment total
      if (formData.showFeesInstallments === 'true') {
        calculateInstallmentFeesTotal();
      }
      
    } catch (error) {
      console.error('Error calculating fees:', error);
    }
  };
  
  // Function to calculate total installment value (base fees + 20%)
  const calculateInstallmentFeesTotal = () => {
    try {
      if (!formData.feesValue) return;
      
      // Convert string value to number
      const baseFeesValue = parseFloat(formData.feesValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(baseFeesValue)) {
        return;
      }
      
      // Add 20% to base fees
      const totalFeesValue = baseFeesValue * 1.2;
      
      // Format the result with Brazilian currency format
      const formattedTotalFees = totalFeesValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Update formData
      setFormData(prev => ({
        ...prev,
        feesTotalInstallmentValue: formattedTotalFees
      }));
      
    } catch (error) {
      console.error('Error calculating installment fees total:', error);
    }
  };

  // Function to calculate individual installment value
  const calculateInstallmentValue = () => {
    try {
      if (!formData.feesTotalInstallmentValue || !formData.feesInstallments) return;
      
      // Convert string values to numbers
      const totalValue = parseFloat(formData.feesTotalInstallmentValue.replace(/\./g, '').replace(',', '.'));
      const installments = parseInt(formData.feesInstallments);
      
      if (isNaN(totalValue) || isNaN(installments) || installments <= 0) {
        return;
      }
      
      // Calculate installment value
      const installmentValue = totalValue / installments;
      
      // Format the result with Brazilian currency format
      const formattedInstallmentValue = installmentValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Update formData with the calculated installment value
      setFormData(prev => ({
        ...prev,
        feesInstallmentValue: formattedInstallmentValue
      }));
      
    } catch (error) {
      console.error('Error calculating installment value:', error);
    }
  };

  return {
    calculateFees,
    calculateInstallmentFeesTotal,
    calculateInstallmentValue
  };
};
