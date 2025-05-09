
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentMethod } from "@/lib/types";
import { useUsers } from "@/hooks/useUsers";
import { pt } from "date-fns/locale";

interface SaleDetailsFieldsProps {
  form: UseFormReturn<any>;
  date: Date;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  autoFocusRef?: React.RefObject<HTMLInputElement>;
  isAdmin?: boolean;
}

export function SaleDetailsFields({
  form,
  date,
  setDate,
  disabled = false,
  autoFocusRef,
  isAdmin = false
}: SaleDetailsFieldsProps) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const { users, isLoading: loadingUsers } = isAdmin ? useUsers() : { users: [], isLoading: false };
  
  useEffect(() => {
    console.log("SaleDetailsFields rendered with date:", date);
  }, [date]);
  
  return (
    <div className="space-y-4">
      {/* Campo de vendedor - mostra select para admin ou input para vendedor */}
      {isAdmin ? (
        <FormField
          control={form.control}
          name="salesperson_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendedor</FormLabel>
              <Select
                disabled={disabled || loadingUsers}
                value={field.value}
                onValueChange={(value) => {
                  // Ao selecionar um vendedor, atualiza também o nome do vendedor
                  const selectedUser = users.find(user => user.id === value);
                  if (selectedUser) {
                    form.setValue("salesperson_name", selectedUser.name || '');
                  }
                  field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loadingUsers ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : (
                    users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="salesperson_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Vendedor</FormLabel>
              <FormControl>
                <Input {...field} disabled={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Valor da venda */}
      <FormField
        control={form.control}
        name="gross_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valor da Venda (R$)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="text"
                placeholder="0,00"
                disabled={disabled}
                ref={autoFocusRef}
                inputMode="decimal"
                onChange={(e) => {
                  // Formatar entrada numérica para moeda brasileira
                  let value = e.target.value;
                  
                  // Remove tudo exceto números e vírgula
                  value = value.replace(/[^\d,]/g, '');
                  
                  // Substitui vírgula por ponto para cálculos
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Data da venda */}
      <FormField
        control={form.control}
        name="sale_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data da Venda</FormLabel>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    {date ? (
                      format(date, "dd/MM/yyyy", { locale: pt })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    setDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={disabled}
                  locale={pt}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Método de pagamento */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <Select
                disabled={disabled}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CREDIT}>Cartão de Crédito</SelectItem>
                  <SelectItem value={PaymentMethod.DEBIT}>Cartão de Débito</SelectItem>
                  <SelectItem value={PaymentMethod.PIX}>Pix</SelectItem>
                  <SelectItem value={PaymentMethod.BOLETO}>Boleto</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parcelas - somente visível para cartão de crédito */}
        {form.watch("payment_method") === PaymentMethod.CREDIT && (
          <FormField
            control={form.control}
            name="installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parcelas</FormLabel>
                <Select
                  disabled={disabled}
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
