
import { useState, useEffect } from "react";
import { Sale, UserRole, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Helper function to convert string to PaymentMethod enum
const convertToPaymentMethod = (method: string): PaymentMethod => {
  switch (method) {
    case "Boleto":
      return PaymentMethod.BOLETO;
    case "Pix":
      return PaymentMethod.PIX;
    case "Crédito":
      return PaymentMethod.CREDIT;
    case "Débito":
      return PaymentMethod.DEBIT;
    default:
      return PaymentMethod.CREDIT; // Default value
  }
};

export const useSales = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchSales = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log("No authenticated user found");
        return;
      }
      
      console.log("Fetching sales for user:", user.id, "with role:", user.role);
      
      // Simple query without filters - RLS is disabled
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });
      
      if (error) {
        console.error("Error querying Supabase:", error);
        throw error;
      }
      
      if (data) {
        console.log("Sales data retrieved:", data.length, "records");
        
        // Client-side filtering based on user role
        let filteredData = data;
        if (user.role === UserRole.SALESPERSON) {
          filteredData = data.filter(sale => sale.salesperson_id === user.id);
          console.log("Filtered data for salesperson:", filteredData.length, "records");
        }
        
        // Map data and ensure all required fields are present
        const formattedSales: Sale[] = filteredData.map((sale) => ({
          id: sale.id,
          salesperson_id: sale.salesperson_id,
          salesperson_name: sale.salesperson_name || 'Unknown',
          gross_amount: sale.gross_amount,
          net_amount: sale.gross_amount, // Use gross_amount as net_amount
          payment_method: convertToPaymentMethod(sale.payment_method),
          installments: sale.installments || 1,
          sale_date: sale.sale_date,
          created_at: sale.created_at,
          client_name: sale.client_name || 'Client',
          client_phone: sale.client_phone || '',
          client_document: sale.client_document || ''
        }));
        
        setSales(formattedSales);
        console.log("Data formatted and set to state:", formattedSales.length, "sales");
      }
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error loading sales",
        description: "Could not load sales. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!saleId) {
      console.error("Invalid sale ID");
      return false;
    }
    
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
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleId));
      
      toast({
        title: "Sale deleted",
        description: "The sale was deleted successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error deleting sale",
        description: error.message || "Could not delete the sale. Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleSaveSale = async (saleData: Omit<Sale, 'id'>, editingSaleId?: string) => {
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
      
      // Get user ID from session
      const supabaseUserId = sessionData.session.user.id;
      console.log("Authenticated user ID (Supabase):", supabaseUserId);
      
      if (!supabaseUserId) {
        throw new Error("User ID not found in session");
      }
      
      // Prepare object for Supabase (convert PaymentMethod enum to string)
      const supabaseData = {
        salesperson_id: supabaseUserId,
        salesperson_name: saleData.salesperson_name,
        gross_amount: saleData.gross_amount,
        payment_method: saleData.payment_method.toString(),
        installments: saleData.installments,
        sale_date: saleData.sale_date,
        client_name: saleData.client_name,
        client_phone: saleData.client_phone,
        client_document: saleData.client_document
      };
      
      let result;
      
      if (editingSaleId) {
        // Update existing sale
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
          // Update local list
          setSales(prevSales => 
            prevSales.map(sale => 
              sale.id === editingSaleId 
                ? { 
                    ...sale, 
                    ...saleData, 
                    id: editingSaleId 
                  } 
                : sale
            )
          );
          
          toast({
            title: "Sale updated",
            description: "The sale was updated successfully.",
          });
        }
      } else {
        // Insert new sale
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
          
          setSales(prevSales => [newSale, ...prevSales]);
          
          toast({
            title: "Sale added",
            description: "New sale registered successfully.",
          });
        }
      }
      return true;
    } catch (error: any) {
      console.error('Error saving sale:', error);
      toast({
        title: "Error saving sale",
        description: error.message || "Could not save the sale. Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  useEffect(() => {
    if (user) {
      console.log("Authenticated user, fetching sales");
      fetchSales();
    } else {
      console.log("No authenticated user, skipping sales fetch");
    }
  }, [user]);
  
  return {
    sales,
    loading,
    fetchSales,
    handleDeleteSale,
    handleSaveSale
  };
};
