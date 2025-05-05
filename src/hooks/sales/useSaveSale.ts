
import { useState } from "react";
import { Sale, PaymentMethod } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { showErrorToast } from "./saleUtils";

type UpdateSalesListFunction = (sale: Sale, isNew: boolean) => void;

export const useSaveSale = (updateSalesList: UpdateSalesListFunction) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveSale = async (saleData: Omit<Sale, 'id'>, editingSaleId?: string): Promise<boolean> => {
    // Safety check to prevent duplicate operations
    if (isSaving) {
      console.log("Save operation already in progress, ignoring");
      return false;
    }
    
    setIsSaving(true);
    console.log("Starting save operation with data:", saleData);
    
    try {
      console.log("Saving sale:", editingSaleId ? "Editing" : "New", saleData);
      
      // Check for authenticated session in Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Authentication error: " + sessionError.message);
      }
      
      if (!sessionData.session) {
        console.error("Session not found");
        
        toast({
          title: "Authentication error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        
        return false;
      }
      
      // Prepare object for Supabase (convert PaymentMethod enum to string)
      const supabaseData = {
        salesperson_id: saleData.salesperson_id,
        salesperson_name: saleData.salesperson_name,
        gross_amount: saleData.gross_amount,
        payment_method: saleData.payment_method.toString(),
        installments: saleData.installments,
        sale_date: saleData.sale_date,
        client_name: saleData.client_name || '',
        client_phone: saleData.client_phone || '',
        client_document: saleData.client_document || ''
      };

      console.log("Prepared data for Supabase:", supabaseData);
      
      let result;
      
      if (editingSaleId) {
        // Update existing sale
        console.log("Updating sale with ID:", editingSaleId);
        result = await supabase
          .from('sales')
          .update(supabaseData)
          .eq('id', editingSaleId)
          .select();
          
        if (result.error) {
          console.error("Error updating:", result.error);
          throw result.error;
        }
        
        console.log("Sale updated successfully:", result.data);
        
        if (result.data && result.data.length > 0) {
          // Create updated sale object
          const updatedSale: Sale = { 
            ...saleData, 
            id: editingSaleId,
            net_amount: saleData.gross_amount
          };
          
          // Update local list
          updateSalesList(updatedSale, false);
          
          toast({
            title: "Sale updated",
            description: "The sale was updated successfully.",
          });
        }
      } else {
        // Insert new sale
        console.log("Inserting new sale");
        result = await supabase
          .from('sales')
          .insert(supabaseData)
          .select();
        
        if (result.error) {
          console.error("Error inserting:", result.error);
          throw result.error;
        }
        
        console.log("Sale inserted successfully:", result.data);
        
        if (result.data && result.data.length > 0) {
          // Add to local list
          const newSale: Sale = {
            id: result.data[0].id,
            salesperson_id: result.data[0].salesperson_id,
            salesperson_name: result.data[0].salesperson_name,
            gross_amount: result.data[0].gross_amount,
            net_amount: result.data[0].gross_amount,  // Use gross_amount as net_amount
            payment_method: saleData.payment_method,  // Keep the enum
            installments: result.data[0].installments,
            sale_date: result.data[0].sale_date,
            created_at: result.data[0].created_at,
            client_name: result.data[0].client_name,
            client_phone: result.data[0].client_phone,
            client_document: result.data[0].client_document
          };
          
          updateSalesList(newSale, true);
          
          toast({
            title: "Sale added",
            description: "New sale registered successfully.",
          });
        }
      }
      return true;
    } catch (error: any) {
      console.error('Error saving sale:', error);
      // Now correctly calling the function with two parameters
      showErrorToast(toast, error.message || "Could not save the sale. Please try again later.");
      return false;
    } finally {
      // Always reset the saving state, even if there's an error
      setIsSaving(false);
      console.log("Save operation completed");
    }
  };
  
  return {
    handleSaveSale,
    isSaving
  };
};
