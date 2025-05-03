import React, { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sale, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { SaleFormSchema } from "./SaleFormSchema";
import { SaleDetailsFields } from "./SaleDetailsFields";
import { ClientFormFields } from "./ClientFormFields";
import { SaleFormActions } from "./SaleFormActions";

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
  const [isClosing, setIsClosing] = useState(false);
  const autoFocusRef = useRef<HTMLInputElement>(null); // <- FOCO

  const form = useForm<z.infer<typeof SaleFormSchema>>({
    resolver: zodResolver(SaleFormSchema),
    defaultValues: {
      salesperson_name: initialData?.salesperson_name || user?.name || "",
      gross_amount: initialData?.gross_amount?.toString() || "",
      payment_method: initialData?.payment_method || PaymentMethod.CREDIT,
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
    } else {
      form.reset({
        salesperson_name: user?.name || "",
        gross_amount: "",
        payment_method: PaymentMethod.CREDIT,
        installments: 1,
        sale_date: new Date(),
        client_name: '',
        client_phone: '',
        client_document: ''
      });
    }
  }, [initialData, user, form]);

  // Força o foco no campo "Valor Bruto"
  useEffect(() => {
    if (open && autoFocusRef.current) {
      setTimeout(() => {
        autoFocusRef.current?.focus();
      }, 10);
    }
  }, [open]);

  const handleDialogClose = useCallback((isOpen: boolean) => {
    if (!isOpen && !isSubmitting && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        onCancel();
        setIsClosing(false);
      }, 100);
    }
  }, [isSubmitting, onCancel, isClosing]);

  const onSubmit = useCallback((values: z.infer<typeof SaleFormSchema>) => {
    const parsedAmount = parseFloat(values.gross_amount.replace(",", "."));

    const saleData: Omit<Sale, 'id'> = {
      salesperson_id: user?.id || 'system',
      salesperson_name: values.salesperson_name,
      gross_amount: parsedAmount,
      net_amount: parsedAmount,
      payment_method: values.payment_method,
      installments: values.installments,
      sale_date: values.sale_date.toISOString(),
      client_name: values.client_name || '',
      client_phone: values.client_phone || '',
      client_document: values.client_document || ''
    };

    onSave(saleData);
  }, [user, onSave]);

  const handleCancel = useCallback(() => {
    if (!isSubmitting && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        onCancel();
        setIsClosing(false);
      }, 100);
    }
  }, [onCancel, isSubmitting, isClosing]);

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="sm:max-w-md" 
        aria-describedby="sale-form-description"
      >
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
          <DialogDescription id="sale-form-description">
            {initialData 
              ? 'Atualize os dados da venda conforme necessário.' 
              : 'Preencha os dados para registrar uma nova venda.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SaleDetailsFields 
            form={form}
            date={date}
            setDate={setDate}
            disabled={isSubmitting}
            autoFocusRef={autoFocusRef} // <- AQUI
          />
          
          <ClientFormFields 
            form={form}
            disabled={isSubmitting}
          />
          
          <SaleFormActions 
            isSubmitting={isSubmitting} 
            initialData={initialData} 
            onCancel={handleCancel} 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
