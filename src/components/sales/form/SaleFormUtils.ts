
import { toast } from "@/hooks/use-toast";

export const validateSaleForm = (
  clientName: string, 
  clientPhone: string, 
  clientDocument: string, 
  amount: number
): boolean => {
  if (!clientName.trim()) {
    toast({
      title: "Validation error",
      description: "Client name is required",
      variant: "destructive",
    });
    return false;
  }
  
  if (!clientPhone.trim() || clientPhone === '+') {
    toast({
      title: "Validation error",
      description: "Client phone is required",
      variant: "destructive",
    });
    return false;
  }
  
  if (!/^\+[0-9]+$/.test(clientPhone)) {
    toast({
      title: "Validation error",
      description: "Invalid phone format. Use the international format +5521999999999",
      variant: "destructive",
    });
    return false;
  }
  
  if (!clientDocument.trim()) {
    toast({
      title: "Validation error",
      description: "CPF/CNPJ is required",
      variant: "destructive",
    });
    return false;
  }
  
  if (amount <= 0) {
    toast({
      title: "Validation error",
      description: "Sale amount must be greater than zero",
      variant: "destructive",
    });
    return false;
  }
  
  return true;
};
