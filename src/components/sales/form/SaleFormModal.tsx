
// SaleFormModal.tsx
import React, { useState, useEffect, useCallback, useRef, useId } from "react";
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
  onSave: (saleData: Omit<Sale, "id">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  open?: boolean;
}

export function SaleFormModal({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
  open = false,
}: SaleFormModalProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(
    initialData ? new Date(initialData.sale_date) : new Date()
  );
  const autoFocusRef = useRef<HTMLInputElement>(null);

  // id único para aria-describedby
  const descriptionId = useId();

  const form = useForm<z.infer<typeof SaleFormSchema>>({
    resolver: zodResolver(SaleFormSchema),
    defaultValues: {
      salesperson_id: initialData?.salesperson_id || user?.id || "",
      salesperson_name: initialData?.salesperson_name || user?.name || "",
      gross_amount: initialData?.gross_amount?.toString() || "",
      payment_method: initialData?.payment_method || PaymentMethod.CREDIT,
      installments: initialData?.installments || 1,
      sale_date: initialData ? new Date(initialData.sale_date) : new Date(),
      client_name: initialData?.client_name || "",
      client_phone: initialData?.client_phone || "",
      client_document: initialData?.client_document || "",
    },
    mode: "onChange",
  });

  // ressincroniza quando muda a venda em edição
  useEffect(() => {
    if (initialData) {
      setDate(new Date(initialData.sale_date));
      form.reset({
        salesperson_id: initialData.salesperson_id,
        salesperson_name: initialData.salesperson_name,
        gross_amount: initialData.gross_amount.toString(),
        payment_method: initialData.payment_method,
        installments: initialData.installments,
        sale_date: new Date(initialData.sale_date),
        client_name: initialData.client_name || "",
        client_phone: initialData.client_phone || "",
        client_document: initialData.client_document || "",
      });
    } else {
      setDate(new Date());
      form.reset({
        salesperson_id: user?.id || "",
        salesperson_name: user?.name || "",
        gross_amount: "",
        payment_method: PaymentMethod.CREDIT,
        installments: 1,
        sale_date: new Date(),
        client_name: "",
        client_phone: "",
        client_document: "",
      });
    }
  }, [initialData, user, form]);

  // foco automático confiável
  useEffect(() => {
    if (open && autoFocusRef.current) {
      requestAnimationFrame(() => autoFocusRef.current?.focus());
    }
  }, [open]);

  const handleDialogClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && !isSubmitting) onCancel();
    },
    [isSubmitting, onCancel]
  );

  const onSubmit = useCallback(
    (values: z.infer<typeof SaleFormSchema>) => {
      console.log("Form submitted with values:", values);
      
      try {
        // Convert gross_amount from string to number
        const grossAmountStr = values.gross_amount.replace(",", ".");
        const parsedAmount = parseFloat(grossAmountStr);
        
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          console.error("Invalid amount:", grossAmountStr);
          throw new Error("Valor bruto inválido. Insira um número maior que zero.");
        }
        
        console.log("Parsed amount:", parsedAmount);

        const saleData: Omit<Sale, "id"> = {
          salesperson_id: values.salesperson_id,
          salesperson_name: values.salesperson_name,
          gross_amount: parsedAmount,
          net_amount: parsedAmount,
          payment_method: values.payment_method,
          installments: values.installments,
          sale_date: values.sale_date.toISOString(),
          client_name: values.client_name || "",
          client_phone: values.client_phone || "",
          client_document: values.client_document || "",
        };

        console.log("Calling onSave with data:", saleData);
        onSave(saleData);
      } catch (error) {
        console.error("Error preparing sale data:", error);
        // Form validation should prevent this, but just in case
      }
    },
    [onSave]
  );

  console.log("Form state:", form.formState);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={descriptionId}
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Venda" : "Nova Venda"}
          </DialogTitle>

          <DialogDescription id={descriptionId}>
            {initialData
              ? "Atualize os dados da venda."
              : "Preencha os dados para registrar a venda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SaleDetailsFields
            form={form}
            date={date}
            setDate={setDate}
            disabled={isSubmitting}
            autoFocusRef={autoFocusRef}
          />

          <ClientFormFields form={form} disabled={isSubmitting} />

          <SaleFormActions
            isSubmitting={isSubmitting}
            initialData={initialData}
            onCancel={onCancel}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
