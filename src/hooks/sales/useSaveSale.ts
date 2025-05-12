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
      console.log("Sale date before processing:", saleData.sale_date);

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
      
      // Ensure date is in YYYY-MM-DD format for database storage
      let formattedDate = saleData.sale_date;
      
      // If it's already a string in YYYY-MM-DD format, keep it
      if (typeof formattedDate === 'string' && formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log("Date is already in YYYY-MM-DD format:", formattedDate);
      } else {
        // Otherwise, format it properly
        formattedDate = new Date(saleData.sale_date).toISOString().split('T')[0];
        console.log("Date formatted for database:", formattedDate);
      }

      /* converte enum para string antes de enviar */
      const supabaseData = {
        ...saleData,
        payment_method: saleData.payment_method.toString(),
        // Garantir que salesperson_name não seja undefined
        salesperson_name: saleData.salesperson_name,
        // Ensure date is in YYYY-MM-DD format for storage
        sale_date: formattedDate
      };

      // Remove net_amount as it's not in the database schema
      const { net_amount, ...dataWithoutNetAmount } = supabaseData;
      
      console.log("Data being sent to Supabase:", dataWithoutNetAmount);

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

      const savedSale: Sale = {
        ...saleData,
        id: editingSaleId ?? row.id,
        created_at: row.created_at,
        // Ensure we use the date exactly as stored in the database
        sale_date: row.sale_date
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
