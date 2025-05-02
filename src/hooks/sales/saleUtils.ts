
import { PaymentMethod } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

// Helper function to convert string to PaymentMethod enum
export const convertToPaymentMethod = (method: string): PaymentMethod => {
  switch (method) {
    case "Boleto":
      return PaymentMethod.BOLETO;
    case "Pix":
      return PaymentMethod.PIX;
    case "Crédito":
      return PaymentMethod.CREDIT;
    case "Débito":
      return PaymentMethod.DEBIT;
    default:
      return PaymentMethod.CREDIT; // Default value
  }
};

// Show toast error message
export const showErrorToast = (message: string): void => {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};
