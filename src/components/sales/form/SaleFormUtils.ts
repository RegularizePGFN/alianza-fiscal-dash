import { toast } from "@/hooks/use-toast";

export const formatCurrencyInput = (inputValue: string): string => {
  try {
    // Remove currency symbols and non-numeric characters for parsing
    const numValue = parseFloat(
      inputValue
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .replace(/[^\d.]/g, '')
    );
    
    if (!isNaN(numValue)) {
      return numValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return '0,00';
    }
  } catch (e) {
    return '0,00';
  }
};

export const formatPhoneNumber = (value: string): string => {
  let formattedValue = value.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!formattedValue.startsWith('+')) {
    formattedValue = '+' + formattedValue;
  }
  
  // If it's just the + sign, keep it as is
  if (formattedValue === '+') {
    return formattedValue;
  }
  
  // Otherwise, format it as needed
  if (formattedValue.startsWith('+55')) {
    // Brazilian format
    if (formattedValue.length > 13) {
      // +55 21 99999-9999 format (mobile)
      formattedValue = formattedValue.slice(0, 13);
    }
  } else {
    // Generic international format, limit to reasonable length
    if (formattedValue.length > 16) {
      formattedValue = formattedValue.slice(0, 16);
    }
  }
  
  return formattedValue;
};

export const formatDocumentNumber = (value: string): string => {
  let formattedValue = value.replace(/[^\d]/g, '');
  
  if (formattedValue.length <= 11) {
    // Format as CPF: 000.000.000-00
    formattedValue = formattedValue
      .replace(/(\d{3})(?=\d)/, '$1.')
      .replace(/(\d{3})(?=\d)/, '$1.')
      .replace(/(\d{3})(?=\d)/, '$1-');
  } else {
    // Format as CNPJ: 00.000.000/0000-00
    formattedValue = formattedValue.slice(0, 14); // Limit to 14 digits
    formattedValue = formattedValue
      .replace(/(\d{2})(?=\d)/, '$1.')
      .replace(/(\d{3})(?=\d)/, '$1.')
      .replace(/(\d{3})(?=\d)/, '$1/')
      .replace(/(\d{4})(?=\d)/, '$1-');
  }
  
  return formattedValue;
};

export const validateSaleForm = (
  clientName: string,
  clientPhone: string,
  clientDocument: string,
  amount: number
): boolean => {
  if (!clientName.trim()) {
    toast({
      title: "Erro de validação",
      description: "O nome do cliente é obrigatório",
      variant: "destructive",
    });
    return false;
  }
  
  if (!clientPhone.trim() || clientPhone === '+') {
    toast({
      title: "Erro de validação",
      description: "O telefone do cliente é obrigatório",
      variant: "destructive",
    });
    return false;
  }
  
  if (!/^\+[0-9]{10,15}$/.test(clientPhone)) {
    toast({
      title: "Erro de validação",
      description: "Formato de telefone inválido. Use o formato +5521999999999",
      variant: "destructive",
    });
    return false;
  }
  
  if (!clientDocument.trim()) {
    toast({
      title: "Erro de validação",
      description: "O CPF/CNPJ do cliente é obrigatório",
      variant: "destructive",
    });
    return false;
  }
  
  if (amount <= 0) {
    toast({
      title: "Erro de validação",
      description: "O valor da venda deve ser maior que zero",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
