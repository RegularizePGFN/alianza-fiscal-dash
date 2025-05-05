/* SaleFormSchema.ts  –  versão simplificada */

import * as z from "zod";
import { PaymentMethod } from "@/lib/types";

export const SaleFormSchema = z.object({
  /* apenas obrigatório – a conversão para número fica no onSubmit */
  gross_amount: z.string().nonempty("Informe o valor bruto"),

  salesperson_name: z
    .string()
    .nonempty("Nome do vendedor é obrigatório"),

  payment_method: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: "Selecione o método de pagamento" }),
  }),

  installments: z
    .number({ invalid_type_error: "Parcelas inválidas" })
    .min(1, "Parcela mínima é 1"),

  sale_date: z.date({
    required_error: "Informe a data da venda",
    invalid_type_error: "Data inválida",
  }),

  client_name: z.string().optional(),
  client_phone: z.string().optional(),
  client_document: z.string().optional(),
});
