
import { useEffect } from 'react';
import { ExtractedData } from '@/lib/types/proposals';

interface UseFeesCalculationProps {
  formData: Partial<ExtractedData>;
  setFormData: (data: Partial<ExtractedData> | ((prev: Partial<ExtractedData>) => Partial<ExtractedData>)) => void;
}

const MIN_FEES = 179.90;

export const useFeesCalculation = ({ formData, setFormData }: UseFeesCalculationProps) => {
  // Recalcula honorários sempre que dívida ou desconto mudarem (cobre caso sem desconto)
  useEffect(() => {
    if (formData.totalDebt) {
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

  // Sugestão automática de honorários:
  // - Com desconto (V < D): 30% × (D − V), piso R$ 179,90
  // - Sem desconto: 15% × D, piso R$ 179,90
  const calculateFees = () => {
    try {
      if (!formData.totalDebt) return;

      const totalDebt = parseFloat(formData.totalDebt.replace(/\./g, '').replace(',', '.'));
      if (isNaN(totalDebt) || totalDebt <= 0) return;

      const discountedRaw = formData.discountedValue
        ? parseFloat(formData.discountedValue.replace(/\./g, '').replace(',', '.'))
        : NaN;

      const hasDiscount = !isNaN(discountedRaw) && discountedRaw > 0 && discountedRaw < totalDebt;

      let feesValue: number;
      if (hasDiscount) {
        const savings = totalDebt - discountedRaw;
        feesValue = savings * 0.3;
      } else {
        feesValue = totalDebt * 0.15;
      }

      if (feesValue < MIN_FEES) feesValue = MIN_FEES;

      const formattedFees = feesValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      setFormData(prev => ({
        ...prev,
        feesValue: formattedFees,
      }));

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
