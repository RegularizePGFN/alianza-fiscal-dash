import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Sale, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ptBR } from 'date-fns/locale';

const saleFormSchema = z.object({
  salesperson_name: z.string().min(2, {
    message: "O nome do vendedor deve ter pelo menos 2 caracteres.",
  }),
  gross_amount: z.string().refine((value) => {
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
    PaymentMethod.CASH,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.PIX,
    PaymentMethod.BANK_TRANSFER,
  ]),
  installments: z.number().min(1).max(12).default(1),
  sale_date: z.date(),
  client_name: z.string().optional(),
  client_phone: z.string().optional(),
  client_document: z.string().optional(),
});

interface SaleFormModalProps {
  initialData?: Sale | null;
  onSave: (saleData: Omit<Sale, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  open?: boolean;
}

export function SaleFormModal({ 
  initialData, 
  onSave, 
  onCancel,
  isSubmitting = false,
  open = false
}: SaleFormModalProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(initialData ? new Date(initialData.sale_date) : new Date());
  
  const form = useForm<z.infer<typeof saleFormSchema>>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      salesperson_name: initialData?.salesperson_name || user?.name || "",
      gross_amount: initialData?.gross_amount?.toString() || "",
      payment_method: initialData?.payment_method || PaymentMethod.CREDIT_CARD,
      installments: initialData?.installments || 1,
      sale_date: initialData ? new Date(initialData.sale_date) : new Date(),
      client_name: initialData?.client_name || '',
      client_phone: initialData?.client_phone || '',
      client_document: initialData?.client_document || ''
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    if (initialData) {
      setDate(new Date(initialData.sale_date));
      form.reset({
        salesperson_name: initialData.salesperson_name,
        gross_amount: initialData.gross_amount.toString(),
        payment_method: initialData.payment_method,
        installments: initialData.installments,
        sale_date: new Date(initialData.sale_date),
        client_name: initialData.client_name || '',
        client_phone: initialData.client_phone || '',
        client_document: initialData.client_document || ''
      });
    }
  }, [initialData, form]);
  
  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      onCancel();
    }
  };
  
  const onSubmit = (values: z.infer<typeof saleFormSchema>) => {
    const parsedAmount = parseFloat(values.gross_amount.replace(",", "."));
    
    const saleData: Omit<Sale, 'id'> = {
      salesperson_id: user?.id || 'system',
      salesperson_name: values.salesperson_name,
      gross_amount: parsedAmount,
      payment_method: values.payment_method,
      installments: values.installments,
      sale_date: values.sale_date.toISOString(),
      client_name: values.client_name || '',
      client_phone: values.client_phone || '',
      client_document: values.client_document || ''
    };
    
    onSave(saleData);
  };
  
  const handleCancel = useCallback(() => {
    if (!isSubmitting) {
      onCancel();
    }
  }, [onCancel, isSubmitting]);
  
  const handleSubmit = form.handleSubmit(onSubmit);
  
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? 'Atualize os dados da venda conforme necessário.' 
              : 'Preencha os dados para registrar uma nova venda.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="salesperson_name">Nome do Vendedor</Label>
            <Input
              id="salesperson_name"
              type="text"
              placeholder="Nome do vendedor"
              {...form.register("salesperson_name")}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            {form.formState.errors.gross_amount && (
              <p className="text-sm text-red-500">
                {form.formState.errors.gross_amount.message}
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="payment_method">Método de Pagamento</Label>
            <Select onValueChange={form.setValue.bind(null, "payment_method")} defaultValue={initialData?.payment_method || PaymentMethod.CREDIT_CARD}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PaymentMethod.CASH}>{PaymentMethod.CASH}</SelectItem>
                <SelectItem value={PaymentMethod.CREDIT_CARD}>{PaymentMethod.CREDIT_CARD}</SelectItem>
                <SelectItem value={PaymentMethod.DEBIT_CARD}>{PaymentMethod.DEBIT_CARD}</SelectItem>
                <SelectItem value={PaymentMethod.PIX}>{PaymentMethod.PIX}</SelectItem>
                <SelectItem value={PaymentMethod.BANK_TRANSFER}>{PaymentMethod.BANK_TRANSFER}</SelectItem>
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
              disabled={isSubmitting}
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
                    setDate(date)
                    form.setValue('sale_date', date || new Date());
                  }}
                  disabled={isSubmitting}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.sale_date && (
              <p className="text-sm text-red-500">
                {form.formState.errors.sale_date.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client_name">Nome do Cliente</Label>
            <Input
              id="client_name"
              type="text"
              placeholder="Nome do cliente (opcional)"
              {...form.register("client_name")}
              disabled={isSubmitting}
            />
            {form.formState.errors.client_name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.client_name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client_phone">Telefone do Cliente</Label>
            <Input
              id="client_phone"
              type="text"
              placeholder="Telefone do cliente (opcional)"
              {...form.register("client_phone")}
              disabled={isSubmitting}
            />
            {form.formState.errors.client_phone && (
              <p className="text-sm text-red-500">
                {form.formState.errors.client_phone.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client_document">Documento do Cliente</Label>
            <Input
              id="client_document"
              type="text"
              placeholder="CPF/CNPJ do cliente (opcional)"
              {...form.register("client_document")}
              disabled={isSubmitting}
            />
            {form.formState.errors.client_document && (
              <p className="text-sm text-red-500">
                {form.formState.errors.client_document.message}
              </p>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : initialData ? (
                'Atualizar'
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
