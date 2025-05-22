
import { CompanyData } from '../types/proposals';

// Helper function to format dates as dd/mm/yyyy
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

// Format address if company data exists
export const formatAddress = (address?: CompanyData['address']) => {
  if (!address) return "Não disponível";
  
  const parts = [
    address.street,
    address.number ? `Nº ${address.number}` : "",
    address.details || "",
    address.district ? `${address.district}` : "",
    address.city && address.state ? `${address.city}/${address.state}` : "",
    address.zip ? `CEP: ${address.zip}` : ""
  ];
  
  return parts.filter(part => part).join(", ");
};

// Format date helper
export const formatDateString = (dateString?: string) => {
  if (!dateString) return "Não disponível";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return "Data inválida";
  }
};

// Helper function to format Brazilian currency
export const formatCurrency = (value?: string) => {
  if (!value) return "R$ 0,00";
  if (value.includes("R$")) return value;
  return `R$ ${value}`;
};

// Calculate economy value between two currency strings
export const calculateEconomy = (totalDebt?: string, discountedValue?: string) => {
  if (!totalDebt || !discountedValue) return "0,00";
  
  try {
    const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    const discountedValue2 = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    
    if (isNaN(totalDebtValue) || isNaN(discountedValue2)) return "0,00";
    
    const economy = totalDebtValue - discountedValue2;
    return economy.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch (e) {
    console.error('Error calculating economy value:', e);
    return "0,00";
  }
};
