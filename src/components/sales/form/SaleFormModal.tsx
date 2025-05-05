// SaleFormModal.tsx
import React, { useState, useEffect, useCallback, useRef, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleFormSchema } from "./SaleFormSchema";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Sale, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { SaleDetailsFields } from "./SaleDetailsFields";
import { ClientFormFields } from "./ClientFormFields";
import { SaleFormActions } from "./SaleFormActions";

interface Props {
  initialData?: Sale | null;
  onSave: (data: Omit<Sale, "id">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  open?: boolean;
}

export function SaleFormModal({
  initialData, onSave, onCancel,
  isSubmitting = false, open = false,
}: Props) {
  const { user } = useAuth();
  const autoFocusRef = useRef<HTMLInputElement>(null);
  const descriptionId = useId();

  const form = useForm({
    resolver: zodResolver(SaleFormSchema),
    defaultValues: {
      salesperson_name: initialData?.salesperson_name || user?.name || "",
      gross_amount: initialData?.gross_amount?.toString() || "",
      payment_method: initialData?.payment_method || PaymentMethod.CREDIT,
      installments: initialData?.installments || 1,
      sale_date: initialData ? new Date(initialData.sale_date) : new Date(),
      client_name: initialData?.client_name || "",
      client_phone: initialData?.client_phone || "",
      client_document: initialData?.client_document || "",
    },
  });

  /* foco ao abrir */
  useEffect(() => {
    if (open && autoFocusRef.current) {
      requestAnimationFrame(() => autoFocusRef.current?.focus());
    }
  }, [open]);

  /* submit */
  const onSubmit = useCallback((values: any) => {
    const amount = Number(values.gross_amount.replace(/\./g, "").replace(",", "."));
    onSave({
      salesperson_id: user?.id || "system",
      salesperson_name: values.salesperson_name,
      gross_amount: amount,
      net_amount: amount,
      payment_method: values.payment_method,
      installments: values.installments,
      sale_date: values.sale_date.toISOString(),
      client_name: values.client_name,
      client_phone: values.client_phone,
      client_document: values.client_document,
    });
  }, [user, onSave]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()} modal={false}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Venda" : "Nova Venda"}</DialogTitle>
          <DialogDescription id={descriptionId}>
            {initialData ? "Atualize os dados da venda." : "Preencha os dados para registrar a venda."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => {
            console.log("FORM‑ERRORS:", err);   // ← veja o console
          })}
          className="space-y-4"
        >
          <SaleDetailsFields
            form={form}
            date={form.watch("sale_date")}
            setDate={(d) => form.setValue("sale_date", d!)}
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
