
import * as z from "zod";
import { PaymentMethod } from "@/lib/types";

export const SaleFormSchema = z.object({
  salesperson_id: z.string().uuid({
    message: "ID do vendedor é obrigatório",
  }),
  salesperson_name: z.string().min(2, {
    message: "O nome do vendedor deve ter pelo menos 2 caracteres.",
  }),
  gross_amount: z.string().min(1, "Valor bruto é obrigatório").refine((value) => {
    try {
      // Substitui vírgulas por pontos e tenta converter para número
      const parsedValue = parseFloat(value.replace(",", "."));
      return !isNaN(parsedValue) && parsedValue > 0;
    } catch (error) {
      return false;
    }
  }, {
    message: "O valor bruto deve ser um número válido maior que zero.",
  }),
  payment_method: z.enum([
    PaymentMethod.BOLETO,
    PaymentMethod.PIX,
    PaymentMethod.CREDIT,
    PaymentMethod.DEBIT,
  ]),
  installments: z.number().min(1).max(12).default(1),
  sale_date: z.date(),
  client_name: z.string().optional(),
  client_phone: z.string().optional(),
  client_document: z.string().optional(),
});
