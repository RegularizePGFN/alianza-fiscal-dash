
import { useState, useEffect } from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import { addMonths, format, isWeekend, setDate, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UseDatesHandlingProps {
  activeTab: string;
  formData: Partial<ExtractedData>;
  setFormData: (data: Partial<ExtractedData>) => void;
}

export const useDatesHandling = ({ activeTab, formData, setFormData }: UseDatesHandlingProps) => {
  // Generate payment dates when switching to proposal tab or when entry installments/total installments change
  useEffect(() => {
    if (activeTab === 'proposal') {
      generatePaymentDates();
    }
  }, [activeTab, formData.entryInstallments, formData.installments]);

  // Get the last business day of a month
  const getLastBusinessDayOfMonth = (date: Date): Date => {
    // Get last day of month
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // If last day is weekend, find the previous business day
    if (isWeekend(lastDay)) {
      return subDays(lastDay, lastDay.getDay() === 0 ? 2 : 1); // Subtract 2 days for Sunday, 1 day for Saturday
    }
    
    return lastDay;
  };

  // Format date for display
  const formatDateBR = (date: Date): string => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Generate payment schedule based on form data
  const generatePaymentDates = () => {
    if (!formData.entryValue || !formData.installmentValue || !formData.installments) {
      return;
    }

    try {
      // Parse values
      const entryInstallments = parseInt(formData.entryInstallments || '1', 10);
      const installments = parseInt(formData.installments, 10);
      
      // Calculate entry installment value per installment
      let entryInstallmentValue = formData.entryValue;
      if (entryInstallments > 1) {
        try {
          const entryValueNum = parseFloat(formData.entryValue.replace(/\./g, '').replace(',', '.'));
          if (!isNaN(entryValueNum) && entryInstallments > 0) {
            const installmentVal = entryValueNum / entryInstallments;
            entryInstallmentValue = installmentVal.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
        } catch (error) {
          console.error('Error calculating entry installment value:', error);
        }
      }
      
      const installmentValue = formData.installmentValue.replace(/\./g, '').replace(',', '.');
      
      // Start with current date
      const startDate = new Date();
      let currentDate = new Date(startDate);
      
      // Generate entry installment dates
      const entryDates = [];
      for (let i = 0; i < entryInstallments; i++) {
        // Get last business day of the current month
        const paymentDate = getLastBusinessDayOfMonth(currentDate);
        
        entryDates.push({
          installment: i + 1,
          date: paymentDate,
          formattedDate: formatDateBR(paymentDate),
          value: entryInstallmentValue
        });
        
        // Move to next month
        currentDate = addMonths(currentDate, 1);
      }
      
      // Generate installment dates (starting after entry installments)
      const installmentDates = [];
      for (let i = 0; i < installments; i++) {
        // Get last business day of the current month
        const paymentDate = getLastBusinessDayOfMonth(currentDate);
        
        installmentDates.push({
          installment: i + 1,
          date: paymentDate,
          formattedDate: formatDateBR(paymentDate),
          value: installmentValue
        });
        
        // Move to next month
        currentDate = addMonths(currentDate, 1);
      }
      
      // Update formData with generated dates
      setFormData({
        ...formData,
        entryDates: JSON.stringify(entryDates),
        installmentDates: JSON.stringify(installmentDates)
      });
      
    } catch (error) {
      console.error('Error generating payment dates:', error);
    }
  };

  return {
    generatePaymentDates
  };
};
