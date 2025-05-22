
import { ExtractedData } from './types';

// Helper function to format dates as dd/mm/yyyy
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

// Helper function to determine if we have payment dates
export const hasDates = (data: Partial<ExtractedData>): boolean => {
  try {
    const entryDates = data.entryDates ? JSON.parse(data.entryDates) : [];
    const installmentDates = data.installmentDates ? JSON.parse(data.installmentDates) : [];
    return entryDates.length > 0 || installmentDates.length > 0;
  } catch (error) {
    return false;
  }
};

// Helper functions for calculations
export const calculateEconomyValue = (totalDebt?: string, discountedValue?: string): string => {
  if (!totalDebt || !discountedValue) return '0,00';
  
  try {
    const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
    const discountedVal = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(totalDebtValue) || isNaN(discountedVal)) return '0,00';
    
    const economyValue = totalDebtValue - discountedVal;
    return economyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch (e) {
    console.error('Error calculating economy value:', e);
    return '0,00';
  }
};

export const calculateDiscountPercentage = (totalDebt?: string, discountedValue?: string): string => {
  if (!totalDebt || !discountedValue) return '0,00';
  
  try {
    const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
    const discountedVal = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(totalDebtValue) || isNaN(discountedVal) || totalDebtValue === 0) return '0,00';
    
    const percentage = ((totalDebtValue - discountedVal) / totalDebtValue) * 100;
    return percentage.toFixed(2).replace('.', ',');
  } catch (e) {
    console.error('Error calculating discount percentage:', e);
    return '0,00';
  }
};

// Function to create a safe filename from client data
export const createSafeFileName = (data: Partial<ExtractedData>, fileType: 'pdf' | 'png'): string => {
  const seller = data.sellerName ? 
    data.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
  
  return `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}.${fileType}`;
};
