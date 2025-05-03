
import { PaymentMethod } from "@/lib/types";
import { PAYMENT_METHODS, INSTALLMENT_OPTIONS } from "@/lib/constants";
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
import { ptBR } from 'date-fns/locale';
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
  disabled = false
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
        {form.formState.errors.salesperson_name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.salesperson_name.message}
          </p>
        )}
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
        {form.formState.errors.gross_amount && (
          <p className="text-sm text-red-500">
            {form.formState.errors.gross_amount.message}
          </p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="payment_method">Método de Pagamento</Label>
        <Select 
          onValueChange={(value) => form.setValue("payment_method", value as PaymentMethod)} 
          defaultValue={form.getValues("payment_method")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o método de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PaymentMethod.BOLETO}>{PaymentMethod.BOLETO}</SelectItem>
            <SelectItem value={PaymentMethod.PIX}>{PaymentMethod.PIX}</SelectItem>
            <SelectItem value={PaymentMethod.CREDIT}>{PaymentMethod.CREDIT}</SelectItem>
            <SelectItem value={PaymentMethod.DEBIT}>{PaymentMethod.DEBIT}</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.payment_method && (
          <p className="text-sm text-red-500">
            {form.formState.errors.payment_method.message}
          </p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="installments">Parcelas</Label>
        <Input
          id="installments"
          type="number"
          placeholder="1"
          {...form.register("installments", { valueAsNumber: true })}
          disabled={disabled}
          defaultValue={1}
        />
        {form.formState.errors.installments && (
          <p className="text-sm text-red-500">
            {form.formState.errors.installments.message}
          </p>
        )}
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
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={date}
              onSelect={(date) => {
                setDate(date);
                form.setValue('sale_date', date || new Date());
              }}
              disabled={disabled}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.sale_date && (
          <p className="text-sm text-red-500">
            {form.formState.errors.sale_date.message}
          </p>
        )}
      </div>
    </>
  );
}
