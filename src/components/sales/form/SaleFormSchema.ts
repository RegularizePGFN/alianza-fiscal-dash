/**
 * SaleFormSchema.ts  –  esquema Zod usado no SaleFormModal
 */
import * as z from "zod";
import { PaymentMethod } from "@/lib/types";

/* util: converte "1.234,56" → 1234.56  |  "" → undefined */
const parseAmount = (val: unknown) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/\./g, "").replace(",", ".");
    if (cleaned.trim() === "") return undefined;
    const n = Number(cleaned);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
};

export const SaleFormSchema = z.object({
  salesperson_name: z
    .string()
    .nonempty("Nome do vendedor é obrigatório"),

  /* aceita string ou number, converte p/ número e exige > 0 */
  gross_amount: z.preprocess(
    parseAmount,
    z
      .number({
        required_error: "Informe o valor bruto",
        invalid_type_error: "Valor inválido",
      })
      .positive("Valor deve ser maior que zero")
  ),

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
