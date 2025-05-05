
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const autoFocusRef = useRef<HTMLInputElement>(null);
  const descriptionId = useId();

  const form = useForm({
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
  });

  /* foco ao abrir */
  useEffect(() => {
    if (open && autoFocusRef.current) {
      requestAnimationFrame(() => autoFocusRef.current?.focus());
    }
  }, [open]);

  /* submit */
  const onSubmit = useCallback((values: any) => {
    try {
      console.log("Form values on submit:", values);
      
      // Certifique-se de que temos um ID de vendedor
      if (!values.salesperson_id) {
        console.error("Missing salesperson_id");
        toast({ 
          title: "Erro ao salvar",
          description: "Selecione um vendedor válido",
          variant: "destructive"
        });
        return;
      }

      // Converter o valor bruto de string para número
      const amount = Number(values.gross_amount.replace(/\./g, "").replace(",", "."));
      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid gross_amount:", values.gross_amount);
        toast({ 
          title: "Erro ao salvar",
          description: "Valor bruto inválido",
          variant: "destructive"
        });
        return;
      }

      const saleData = {
        salesperson_id: values.salesperson_id,
        salesperson_name: values.salesperson_name,
        gross_amount: amount,
        net_amount: amount, // Por enquanto, mantemos igual ao valor bruto
        payment_method: values.payment_method,
        installments: values.installments,
        sale_date: values.sale_date.toISOString(),
        client_name: values.client_name || "",
        client_phone: values.client_phone || "",
        client_document: values.client_document || "",
      };
      
      console.log("Sale data being sent:", saleData);
      onSave(saleData);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({ 
        title: "Erro ao salvar", 
        description: "Ocorreu um erro ao processar o formulário", 
        variant: "destructive"
      });
    }
  }, [onSave, toast]);

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
            console.log("FORM‑ERRORS:", err);
            toast({ 
              title: "Erro de validação", 
              description: "Verifique os campos do formulário", 
              variant: "destructive"
            });
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
