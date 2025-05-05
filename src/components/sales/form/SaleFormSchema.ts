// SaleFormSchema.ts
import * as z from "zod";
import { PaymentMethod } from "@/lib/types";

/**
 * Converte “1.234,56” → 1234.56 e verifica se é um número > 0
 */
const stringToPositive = (v: string) => {
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return !isNaN(n) && n > 0;
};

export const SaleFormSchema = z.object({
  salesperson_name: z
    .string()
    .nonempty("Nome do vendedor é obrigatório"),

  gross_amount: z
    .string()
    .nonempty("Informe o valor bruto")
    .refine(stringToPositive, "Valor deve ser maior que zero"),

  payment_method: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Selecione o método de pagamento" }),
  }),

  installments: z
    .number()
    .min(1, "Parcelas deve ser pelo menos 1"),

  sale_date: z.date({
    required_error: "Informe a data da venda",
    invalid_type_error: "Data inválida",
  }),

  /* campos de cliente são opcionais */
  client_name: z.string().optional(),
  client_phone: z.string().optional(),
  client_document: z.string().optional(),
});
