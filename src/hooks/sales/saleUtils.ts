
import { PaymentMethod } from "@/lib/types";

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

// Show toast error message - updated to accept toast object parameter
export const showErrorToast = (toastObj: any, message: string): void => {
  toastObj({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};
