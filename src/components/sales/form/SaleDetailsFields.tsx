// SaleDetailsFields.tsx
import { PaymentMethod } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { SaleFormSchema } from "./SaleFormSchema";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

interface SaleDetailsFieldsProps {
  form: UseFormReturn<z.infer<typeof SaleFormSchema>>;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  autoFocusRef?: React.RefObject<HTMLInputElement>;
}

export function SaleDetailsFields({
  form,
  date,
  setDate,
  disabled = false,
  autoFocusRef
}: SaleDetailsFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="salesperson_name">Nome do Vendedor</Label>
        <Input
          id="salesperson_name"
          type="text"
          placeholder="Nome do vendedor"
          {...form.register("salesperson_name")}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="gross_amount">Valor Bruto</Label>
        <Input
          id="gross_amount"
          type="text"
          placeholder="0,00"
          {...form.register("gross_amount")}
          disabled={disabled}
          ref={autoFocusRef}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="payment_method">Forma de Pagamento</Label>
        <Select
          onValueChange={(value) =>
            form.setValue("payment_method", value as PaymentMethod)
          }
          defaultValue={form.getValues("payment_method")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PaymentMethod.BOLETO}>Boleto</SelectItem>
            <SelectItem value={PaymentMethod.PIX}>Pix</SelectItem>
            <SelectItem value={PaymentMethod.CREDIT}>Crédito</SelectItem>
            <SelectItem value={PaymentMethod.DEBIT}>Débito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="installments">Parcelas</Label>
        <Input
          id="installments"
          type="number"
          placeholder="1"
          {...form.register("installments", { valueAsNumber: true })}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-2">
        <Label>Data da Venda</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date
                ? format(date, "dd/MM/yyyy", { locale: ptBR })
                : "Selecione a data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                form.setValue("sale_date", selectedDate || new Date());
              }}
              disabled={disabled}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
