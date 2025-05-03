
import { toast } from "@/hooks/use-toast";

export const validateSaleForm = (
  clientName: string, 
  clientPhone: string, 
  clientDocument: string, 
  amount: number
): boolean => {
  if (!clientName.trim()) {
    toast({
      title: "Erro de validação",
      description: "Nome do cliente é obrigatório",
      variant: "destructive",
    });
    return false;
  }
  
  if (!clientPhone.trim() || clientPhone === '+') {
    toast({
      title: "Erro de validação",
      description: "Telefone do cliente é obrigatório",
      variant: "destructive",
    });
    return false;
  }
  
  if (!/^\+[0-9]+$/.test(clientPhone)) {
    toast({
      title: "Erro de validação",
      description: "Formato de telefone inválido. Use o formato internacional +5521999999999",
      variant: "destructive",
    });
    return false;
  }
  
  if (!clientDocument.trim()) {
    toast({
      title: "Erro de validação",
      description: "CPF/CNPJ é obrigatório",
      variant: "destructive",
    });
    return false;
  }
  
  if (amount <= 0) {
    toast({
      title: "Erro de validação",
      description: "Valor da venda deve ser maior que zero",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
