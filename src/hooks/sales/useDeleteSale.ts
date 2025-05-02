
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { showErrorToast } from "./saleUtils";

export const useDeleteSale = (updateSalesList: (saleId: string) => void) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSale = async (saleId: string): Promise<boolean> => {
    if (!saleId) {
      console.error("Invalid sale ID");
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting sale:", saleId);
      
      // Check if we have an authenticated session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast({
          title: "Authentication error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        return false;
      }
      
      // Simple delete operation
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);
      
      if (error) {
        console.error("Error deleting:", error);
        throw error;
      }
      
      console.log("Sale deleted successfully");
      
      // Update local list after successful deletion
      updateSalesList(saleId);
      
      toast({
        title: "Sale deleted",
        description: "The sale was deleted successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      showErrorToast(toast, error.message || "Could not delete the sale. Please try again later.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    handleDeleteSale,
    isDeleting
  };
};
