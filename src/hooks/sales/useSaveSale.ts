
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { showErrorToast } from "./saleUtils";
import { Sale } from "@/lib/types";

type UpdateSalesListFunction = (sale: Sale, isNew: boolean) => void;

export const useSaveSale = (updateSalesList: UpdateSalesListFunction) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSale = async (
    saleData: Omit<Sale, "id">,
    editingSaleId?: string
  ): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);

    try {
      console.log("Saving sale data:", saleData);
      console.log("Sale date before processing:", saleData.sale_date, typeof saleData.sale_date);

      if (!saleData.gross_amount || saleData.gross_amount <= 0) {
        throw new Error("Valor bruto deve ser maior que zero");
      }

      if (!saleData.salesperson_id) {
        throw new Error("ID do vendedor é obrigatório");
      }

      // Verificar se o salesperson_name está presente
      if (!saleData.salesperson_name) {
        throw new Error("Nome do vendedor é obrigatório");
      }
      
      // Critical: Ensure date is in YYYY-MM-DD format for database storage
      // If sale_date isn't a string, it's probably a Date object that needs formatting
      let formattedDate: string;
      
      // If already in YYYY-MM-DD format, use as is
      if (typeof saleData.sale_date === 'string' && saleData.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = saleData.sale_date;
        console.log("Using existing YYYY-MM-DD format:", formattedDate);
      } 
      // Convert to YYYY-MM-DD string
      else {
        if (typeof saleData.sale_date === 'object' && saleData.sale_date !== null) {
          // Format as YYYY-MM-DD using local date parts
          const d = saleData.sale_date as Date;
          formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } else if (typeof saleData.sale_date === 'string') {
          // Try to parse as date then format
          const d = new Date(saleData.sale_date);
          if (!isNaN(d.getTime())) {
            formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } else {
            // Fallback if parsing fails
            formattedDate = new Date().toISOString().split('T')[0];
            console.warn("Failed to parse date string, using today's date instead:", formattedDate);
          }
        } else {
          // Fallback
          formattedDate = new Date().toISOString().split('T')[0];
        }
        console.log("Converted to YYYY-MM-DD format:", formattedDate);
      }

      /* Prepare data for Supabase */
      const supabaseData = {
        ...saleData,
        payment_method: saleData.payment_method.toString(),
        salesperson_name: saleData.salesperson_name,
        // Use the properly formatted date
        sale_date: formattedDate
      };

      // Remove net_amount as it's not in the database schema
      const { net_amount, ...dataWithoutNetAmount } = supabaseData;
      
      console.log("Data being sent to Supabase:", dataWithoutNetAmount);
      console.log("Final sale_date being sent:", dataWithoutNetAmount.sale_date);

      let result;
      if (editingSaleId) {
        result = await supabase
          .from("sales")
          .update(dataWithoutNetAmount)
          .eq("id", editingSaleId)
          .select();
      } else {
        result = await supabase
          .from("sales")
          .insert(dataWithoutNetAmount)
          .select();
      }

      if (result.error) {
        console.error("Supabase error:", result.error);
        throw result.error;
      }

      if (!result.data || result.data.length === 0) {
        throw new Error("Não foi possível salvar a venda. Nenhum dado retornado.");
      }

      console.log("Supabase response:", result);
      const row = result.data[0];
      console.log("Returned sale_date:", row.sale_date);

      // Use the date returned from the database to ensure consistency
      const savedSale: Sale = {
        ...saleData,
        id: editingSaleId ?? row.id,
        created_at: row.created_at,
        sale_date: row.sale_date // Use exactly what the database returned
      };

      console.log("Updating sales list with:", savedSale);
      updateSalesList(savedSale, !editingSaleId);
      
      toast({
        title: editingSaleId ? "Venda atualizada" : "Venda criada",
        description: "Operação realizada com sucesso",
      });
      
      return true;
    } catch (err: any) {
      console.error("Error saving sale:", err);
      showErrorToast(
        toast,
        err.message || "Erro inesperado ao salvar a venda."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSaveSale, isSaving };
};
