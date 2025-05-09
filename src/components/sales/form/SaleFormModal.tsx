
import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sale } from "@/lib/types";
import { saleFormSchema } from "./SaleFormSchema";
import { generateDefaultValues } from "./SaleFormUtils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ClientFormFields } from "./ClientFormFields";
import { SaleDetailsFields } from "./SaleDetailsFields";
import { SaleFormActions } from "./SaleFormActions";
import { format, parse } from "date-fns";

export type SaleFormData = z.infer<typeof saleFormSchema>;

interface SaleFormModalProps {
  initialData: Sale | null;
  onSave: (data: Omit<Sale, "id">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  open: boolean;
}

export function SaleFormModal({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
  open = false,
}: SaleFormModalProps) {
  const isEditing = !!initialData?.id;
  
  // Prepare form with either initial data or defaults
  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: generateDefaultValues(initialData),
  });

  // Reset form when initialData changes or when modal is opened/closed
  useEffect(() => {
    if (open) {
      form.reset(generateDefaultValues(initialData));
    }
  }, [initialData, form, open]);

  // Form submission handler
  const onSubmit = async (formData: SaleFormData) => {
    try {
      // Format date properly for submission
      const saleDateObj = formData.sale_date instanceof Date 
        ? formData.sale_date
        : parse(formData.sale_date as unknown as string, 'yyyy-MM-dd', new Date());
      
      const formattedSaleDate = format(saleDateObj, 'yyyy-MM-dd');

      const saleData: Omit<Sale, "id"> = {
        salesperson_id: formData.salesperson_id,
        salesperson_name: formData.salesperson_name,
        gross_amount: Number(formData.gross_amount),
        net_amount: Number(formData.gross_amount), // For now, net_amount equals gross_amount
        payment_method: formData.payment_method,
        installments: formData.installments,
        sale_date: formattedSaleDate,
        client_name: formData.client_name,
        client_phone: formData.client_phone || "",
        client_document: formData.client_document || "",
        created_at: initialData?.created_at || new Date().toISOString(),
      };

      onSave(saleData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !isSubmitting && onCancel()}>
      <DialogContent className="max-w-2xl sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar Venda" : "Nova Venda"}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SaleDetailsFields control={form.control} />
            <ClientFormFields control={form.control} />
            <SaleFormActions 
              isSubmitting={isSubmitting} 
              onCancel={onCancel}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
