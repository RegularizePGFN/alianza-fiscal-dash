
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { SaleFormSchema } from "./SaleFormSchema";

interface ClientFormFieldsProps {
  form: UseFormReturn<z.infer<typeof SaleFormSchema>>;
  disabled?: boolean;
}

export function ClientFormFields({
  form,
  disabled = false,
}: ClientFormFieldsProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, "");
    if (!value.startsWith("+")) value = "+" + value;
    if (value === "+") {
      form.setValue("client_phone", value);
    } else {
      form.setValue("client_phone", value);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, "");

    if (value.length <= 11) {
      // CPF: 000.000.000-00
      value = value
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    } else {
      // CNPJ: 00.000.000/0000-00
      value = value.slice(0, 14);
      value = value
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }

    form.setValue("client_document", value);
  };

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="client_name">Nome do Cliente/Empresa</Label>
        <Input
          id="client_name"
          placeholder="Nome completo do cliente ou empresa"
          value={form.watch("client_name") || ""}
          onChange={(e) => form.setValue("client_name", e.target.value)}
          disabled={disabled}
        />
        {form.formState.errors.client_name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.client_name.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="client_phone">Telefone</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Phone className="h-4 w-4" />
          </span>
          <Input
            id="client_phone"
            placeholder="+5521999999999"
            className="pl-10"
            value={form.watch("client_phone") || ""}
            onChange={handlePhoneChange}
            disabled={disabled}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Formato internacional: +55 seguido do DDD e número
        </p>
        {form.formState.errors.client_phone && (
          <p className="text-sm text-red-500">
            {form.formState.errors.client_phone.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="client_document">CPF/CNPJ</Label>
        <Input
          id="client_document"
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          value={form.watch("client_document") || ""}
          onChange={handleDocumentChange}
          disabled={disabled}
        />
        {form.formState.errors.client_document && (
          <p className="text-sm text-red-500">
            {form.formState.errors.client_document.message}
          </p>
        )}
      </div>
    </>
  );
}
