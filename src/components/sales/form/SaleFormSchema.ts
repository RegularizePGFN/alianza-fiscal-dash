
/* SaleFormSchema.ts */

import * as z from "zod";
import { PaymentMethod } from "@/lib/types";

export const SaleFormSchema = z.object({
  /* campo obrigatório para valor bruto com validação para ser um valor válido */
  gross_amount: z.string()
    .nonempty("Informe o valor bruto")
    .transform((val) => {
      // Remove os pontos de milhar e substitui vírgula por ponto
      return val.replace(/\./g, "").replace(",", ".");
    })
    .refine((val) => {
      const numVal = Number(val);
      return !isNaN(numVal) && numVal > 0;
    }, "Valor bruto deve ser um número válido maior que zero"),

  /* campos obrigatórios */
  salesperson_id: z.string().uuid("Selecione um vendedor válido").nonempty("Vendedor é obrigatório"),
  salesperson_name: z.string().nonempty("Nome do vendedor é obrigatório"),
  
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

  /* campos opcionais */
  client_name: z.string().optional(),
  client_phone: z.string().optional(),
  client_document: z.string().optional(),
});
