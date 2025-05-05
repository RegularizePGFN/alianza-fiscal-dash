
// SaleDetailsFields.tsx
import { PaymentMethod, User, UserRole } from "@/lib/types";
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
import { useUsers } from "@/hooks/useUsers";
import { useState, useEffect } from "react";

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
  const { users, isLoading } = useUsers();
  const [salespeople, setSalespeople] = useState<User[]>([]);

  // Filter users to get only salespeople
  useEffect(() => {
    if (users && users.length > 0) {
      const salesPersons = users.filter(user => 
        user.role === UserRole.SALESPERSON || user.role === UserRole.ADMIN
      );
      setSalespeople(salesPersons);
      
      // Set default salesperson if none is selected yet
      const currentSalespersonId = form.getValues("salesperson_id");
      if (!currentSalespersonId && salesPersons.length > 0) {
        const defaultSalesperson = salesPersons[0];
        form.setValue("salesperson_id", defaultSalesperson.id);
        form.setValue("salesperson_name", defaultSalesperson.name);
      }
    }
  }, [users, form]);

  // Handle salesperson selection change
  const handleSalespersonChange = (salespersonId: string) => {
    console.log("Selected salesperson ID:", salespersonId);
    const selectedSalesperson = salespeople.find(person => person.id === salespersonId);
    
    if (selectedSalesperson) {
      console.log("Setting salesperson:", selectedSalesperson.name);
      form.setValue("salesperson_id", selectedSalesperson.id);
      form.setValue("salesperson_name", selectedSalesperson.name);
    }
  };

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="salesperson_id">Nome do Vendedor</Label>
        <Select
          disabled={disabled || isLoading}
          onValueChange={handleSalespersonChange}
          defaultValue={form.getValues("salesperson_id")}
          value={form.getValues("salesperson_id")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o vendedor"} />
          </SelectTrigger>
          <SelectContent>
            {salespeople.map((salesperson) => (
              <SelectItem key={salesperson.id} value={salesperson.id}>
                {salesperson.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.salesperson_id && (
          <p className="text-xs text-destructive">{form.formState.errors.salesperson_id.message}</p>
        )}
        {isLoading && <p className="text-xs text-muted-foreground">Carregando vendedores...</p>}
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
          <p className="text-xs text-destructive">{form.formState.errors.gross_amount.message}</p>
        )}
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
        {form.formState.errors.payment_method && (
          <p className="text-xs text-destructive">{form.formState.errors.payment_method.message}</p>
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
        />
        {form.formState.errors.installments && (
          <p className="text-xs text-destructive">{form.formState.errors.installments.message}</p>
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
        {form.formState.errors.sale_date && (
          <p className="text-xs text-destructive">{form.formState.errors.sale_date.message}</p>
        )}
      </div>
    </>
  );
}
