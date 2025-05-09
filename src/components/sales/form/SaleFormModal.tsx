
// SaleFormModal.tsx
import React, { useState, useEffect, useCallback, useRef, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SaleFormSchema } from "./SaleFormSchema";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Sale, PaymentMethod, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { SaleDetailsFields } from "./SaleDetailsFields";
import { ClientFormFields } from "./ClientFormFields";
import { SaleFormActions } from "./SaleFormActions";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";

// Define the form schema type for TypeScript
type FormSchema = z.infer<typeof SaleFormSchema>;
const FORM_STORAGE_KEY = "sale_form_data";

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
  const [isInitialized, setIsInitialized] = useState(false);
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Estado para armazenar a data de venda
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  
  // Parse the initialData correctly to ensure dates are properly set
  const getInitialFormValues = useCallback(() => {
    console.log("Getting initial form values, initialData:", initialData);
    
    // Verifica se existem dados salvos no localStorage e se não há dados iniciais
    // (não queremos usar o localStorage ao editar uma venda existente)
    if (!initialData) {
      try {
        const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData);
          console.log("Restored form data from localStorage:", parsedData);
          
          // Converter a string de data para objeto Date
          if (parsedData.sale_date) {
            const date = new Date(parsedData.sale_date);
            parsedData.sale_date = date;
            setSaleDate(date);
          } else {
            const today = new Date();
            parsedData.sale_date = today;
            setSaleDate(today);
          }
          
          return parsedData;
        }
      } catch (error) {
        console.error("Error loading form data from localStorage:", error);
      }
      
      const today = new Date();
      setSaleDate(today);
      
      return {
        salesperson_id: user?.id || "",
        salesperson_name: user?.name || "",
        gross_amount: "",
        payment_method: PaymentMethod.CREDIT,
        installments: 1,
        sale_date: today,
        client_name: "",
        client_phone: "",
        client_document: "",
      };
    }
    
    console.log("Using initialData sale_date:", initialData.sale_date);
    
    // For editing existing sales, ensure we properly convert the date string to a Date object
    // without timezone adjustments
    let saleDate: Date;
    try {
      if (typeof initialData.sale_date === 'string') {
        // If it's in YYYY-MM-DD format, parse it to preserve the correct date
        const parts = initialData.sale_date.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript
          const day = parseInt(parts[2], 10);
          saleDate = new Date(year, month, day);
        } else {
          saleDate = new Date(initialData.sale_date);
        }
      } else {
        saleDate = new Date(); // Fallback to today if unable to parse
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      saleDate = new Date();
    }
    
    console.log("Parsed sale date:", saleDate);
    setSaleDate(saleDate);
    
    return {
      salesperson_id: initialData.salesperson_id,
      salesperson_name: initialData.salesperson_name || '',
      gross_amount: initialData.gross_amount.toString(),
      payment_method: initialData.payment_method,
      installments: initialData.installments,
      sale_date: saleDate,
      client_name: initialData.client_name || "",
      client_phone: initialData.client_phone || "",
      client_document: initialData.client_document || "",
    };
  }, [initialData, user]);

  // Corrected to use the proper type
  const form = useForm<FormSchema>({
    resolver: zodResolver(SaleFormSchema),
    defaultValues: getInitialFormValues(),
  });
  
  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (open) {
      console.log("Modal opened, resetting form with initialData", initialData);
      const formValues = getInitialFormValues();
      console.log("Form values to set:", formValues);
      form.reset(formValues);
      setIsInitialized(true);
      
      // Limpar dados salvados ao abrir o modal para edição
      if (initialData) {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    } else {
      setIsInitialized(false);
      
      // Limpar dados salvados quando o formulário é cancelado ou enviado com sucesso
      if (!isSubmitting) {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
  }, [initialData, open, form, getInitialFormValues, isSubmitting]);

  /* Salvar dados do formulário quando mudam */
  useEffect(() => {
    if (open && !initialData) {
      const subscription = form.watch((value) => {
        // Não salvar quando estiver editando uma venda existente
        try {
          // Converter a data para formato ISO antes de salvar
          const valueToSave = {...value};
          if (valueToSave.sale_date instanceof Date) {
            valueToSave.sale_date = valueToSave.sale_date.toISOString();
          }
          
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(valueToSave));
        } catch (error) {
          console.error("Error saving form data to localStorage:", error);
        }
      });
      
      return () => subscription.unsubscribe();
    }
  }, [form, open, initialData]);

  /* foco ao abrir */
  useEffect(() => {
    if (open && autoFocusRef.current) {
      // Ensure the component is properly mounted before focusing
      const timeoutId = setTimeout(() => {
        autoFocusRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  /* submit */
  const onSubmit = useCallback((values: FormSchema) => {
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

      // Número já é transformado pelo schema
      const amount = Number(values.gross_amount);
      console.log("Converted amount:", amount);

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
      
      // Limpar dados salvados após envio bem-sucedido
      localStorage.removeItem(FORM_STORAGE_KEY);
      
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

  // Exibe mensagem de log para verificar o fluxo de inicialização
  useEffect(() => {
    console.log("SaleFormModal render - open:", open, "isInitialized:", isInitialized, "initialData:", initialData);
  }, [open, isInitialized, initialData]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()} modal={true}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Venda" : "Nova Venda"}</DialogTitle>
          <DialogDescription id={descriptionId}>
            {initialData ? "Atualize os dados da venda." : "Preencha os dados para registrar a venda."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              console.log("FORM‑ERRORS:", err);
              let errorMessage = "Verifique os campos do formulário";
              
              // Check specifically for gross_amount errors
              if (err.gross_amount) {
                errorMessage = err.gross_amount.message || "Valor bruto inválido";
              }
              
              toast({ 
                title: "Erro de validação", 
                description: errorMessage, 
                variant: "destructive"
              });
            })}
            className="space-y-4"
          >
            <SaleDetailsFields
              form={form}
              date={saleDate}
              setDate={(d) => {
                if (d) {
                  setSaleDate(d);
                  form.setValue("sale_date", d);
                }
              }}
              disabled={isSubmitting}
              autoFocusRef={autoFocusRef}
              isAdmin={isAdmin}
            />
            <ClientFormFields form={form} disabled={isSubmitting} />
            <SaleFormActions
              isSubmitting={isSubmitting}
              initialData={initialData}
              onCancel={onCancel}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
