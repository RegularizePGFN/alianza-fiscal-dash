import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sale } from "@/lib/types";
import { SaleFormSchema } from "./SaleFormSchema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ClientFormFields } from "./ClientFormFields";
import { SaleDetailsFields } from "./SaleDetailsFields";
import { SaleFormActions } from "./SaleFormActions";
import { format } from "date-fns";
import { useAuth } from "@/contexts/auth";
import { parseISODateString } from "@/lib/utils";

export type SaleFormData = z.infer<typeof SaleFormSchema>;

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
  const { user } = useAuth();
  const isEditing = !!initialData?.id;
  const [date, setDate] = useState<Date>(new Date());
  const autoFocusRef = useRef<HTMLInputElement>(null);
  
  // Generate default values function
  const generateDefaultValues = (sale: Sale | null): SaleFormData => {
    if (!sale) {
      return {
        gross_amount: "",
        salesperson_id: user?.id || "",
        salesperson_name: user?.name || "",
        payment_method: "Crédito" as any,
        installments: 1,
        sale_date: new Date(),
        client_name: "",
        client_phone: "",
        client_document: "",
      };
    }

    // Handle the date conversion more carefully
    let saleDate: Date;
    
    if (sale.sale_date) {
      console.log("Sale date from initialData:", sale.sale_date, typeof sale.sale_date);
      
      // If it's a string in YYYY-MM-DD format (from database)
      if (typeof sale.sale_date === 'string' && sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        saleDate = parseISODateString(sale.sale_date);
        console.log("Parsed YYYY-MM-DD date:", saleDate);
      } 
      // Other string formats
      else if (typeof sale.sale_date === 'string') {
        saleDate = new Date(sale.sale_date);
        console.log("Parsed string date:", saleDate);
      }
      // Already a Date object
      else {
        saleDate = sale.sale_date as unknown as Date;
      }
    } else {
      saleDate = new Date();
    }

    return {
      gross_amount: sale.gross_amount.toString(),
      salesperson_id: sale.salesperson_id || "",
      salesperson_name: sale.salesperson_name || "",
      payment_method: sale.payment_method,
      installments: sale.installments || 1,
      sale_date: saleDate,
      client_name: sale.client_name || "",
      client_phone: sale.client_phone || "",
      client_document: sale.client_document || "",
    };
  };
  
  // Prepare form with either initial data or defaults
  const form = useForm<SaleFormData>({
    resolver: zodResolver(SaleFormSchema),
    defaultValues: generateDefaultValues(initialData),
  });

  // Reset form when initialData changes or when modal is opened/closed
  useEffect(() => {
    if (open) {
      console.log("Modal opened with initialData:", initialData);
      const defaultValues = generateDefaultValues(initialData);
      form.reset(defaultValues);
      
      // Set the date state for the calendar
      if (initialData?.sale_date) {
        let dateToUse: Date;
        
        // Handle YYYY-MM-DD string format from database
        if (typeof initialData.sale_date === 'string' && initialData.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateToUse = parseISODateString(initialData.sale_date);
        } 
        // Handle other string formats
        else if (typeof initialData.sale_date === 'string') {
          dateToUse = new Date(initialData.sale_date);
        } 
        // Handle Date objects
        else {
          dateToUse = initialData.sale_date as unknown as Date;
        }
        
        console.log("Setting form date to:", dateToUse);
        setDate(dateToUse);
      } else {
        setDate(new Date());
      }
    }
  }, [initialData, form, open]);

  // Focus on the gross_amount input when modal opens
  useEffect(() => {
    if (open && autoFocusRef.current) {
      setTimeout(() => {
        autoFocusRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Form submission handler
  const onSubmit = async (formData: SaleFormData) => {
    try {
      // Format date properly for submission using date from the calendar
      const formattedSaleDate = format(date, 'yyyy-MM-dd');
      console.log("Submitting with date:", date);
      console.log("Formatted to YYYY-MM-DD:", formattedSaleDate);

      const saleData: Omit<Sale, "id"> = {
        salesperson_id: formData.salesperson_id,
        salesperson_name: formData.salesperson_name,
        gross_amount: Number(formData.gross_amount.replace(',', '.')),
        net_amount: Number(formData.gross_amount.replace(',', '.')), // For now, net_amount equals gross_amount
        payment_method: formData.payment_method,
        installments: formData.installments,
        sale_date: formattedSaleDate,
        client_name: formData.client_name || "",
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
            <SaleDetailsFields 
              form={form}
              date={date}
              setDate={setDate}
              autoFocusRef={autoFocusRef}
            />
            <ClientFormFields 
              form={form} 
            />
            <SaleFormActions 
              isSubmitting={isSubmitting} 
              onCancel={onCancel}
              initialData={initialData}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
