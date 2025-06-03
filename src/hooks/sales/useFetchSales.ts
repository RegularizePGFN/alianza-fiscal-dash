
import { useState, useEffect, useRef } from "react";
import { Sale, UserRole } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { convertToPaymentMethod, showErrorToast } from "./saleUtils";

type User = {
  id: string;
  role?: UserRole;
};

export const useFetchSales = (user: User | null) => {
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add reference to track if fetch is in progress
  const isFetchingRef = useRef(false);
  
  // Add reference to track component mount state
  const isMountedRef = useRef(true);
  
  // Add sales fetch timestamp to prevent redundant fetches
  const lastFetchTimestampRef = useRef(0);
  
  const fetchSales = async () => {
    try {
      // Prevent concurrent fetches and redundant fetches within 2 seconds
      const now = Date.now();
      if (
        isFetchingRef.current || 
        (now - lastFetchTimestampRef.current < 2000 && sales.length > 0)
      ) {
        return;
      }
      
      isFetchingRef.current = true;
      setLoading(true);
      
      if (!user) {
        console.log("No authenticated user found");
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      console.log("Fetching sales for user:", user.id, "with role:", user.role);
      lastFetchTimestampRef.current = now;
      
      // Simple query without filters - RLS is disabled
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });
      
      if (error) {
        console.error("Error querying Supabase:", error);
        throw error;
      }
      
      if (!isMountedRef.current) {
        console.log("Component unmounted during fetch, aborting data processing");
        return;
      }
      
      if (data) {
        console.log("Sales data retrieved:", data.length, "records");
        if (data.length > 0) {
          // Log sample dates for debugging
          console.log("First 3 sale dates from database:");
          data.slice(0, 3).forEach((sale, i) => {
            console.log(`Sale ${i+1}:`, sale.id, "Date:", sale.sale_date, "Type:", typeof sale.sale_date);
          });
        }
        
        // Client-side filtering based on user role
        let filteredData = data;
        if (user.role === UserRole.SALESPERSON) {
          filteredData = data.filter(sale => sale.salesperson_id === user.id);
          console.log("Filtered data for salesperson:", filteredData.length, "records");
        }
        
        // Map data and ensure all required fields are present
        const formattedSales: Sale[] = filteredData.map((sale) => {
          // Preservar exatamente a string da data como está no banco de dados
          // Isso é crucial para comparações posteriores
          return {
            id: sale.id,
            salesperson_id: sale.salesperson_id,
            salesperson_name: sale.salesperson_name || 'Unknown',
            gross_amount: sale.gross_amount,
            net_amount: sale.gross_amount, // Use gross_amount as net_amount
            payment_method: convertToPaymentMethod(sale.payment_method),
            installments: sale.installments || 1,
            // Ensure we use the date exactly as stored in the database
            sale_date: sale.sale_date,
            created_at: sale.created_at,
            client_name: sale.client_name || 'Client',
            client_phone: sale.client_phone || '',
            client_document: sale.client_document || ''
          };
        });
        
        if (isMountedRef.current) {
          setSales(formattedSales);
          console.log("Sales data after mapping:", formattedSales.length, "records");
        }
      }
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      if (isMountedRef.current) {
        showErrorToast(toast, "Could not load sales. Please try again later.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  };

  // Update sales list handlers
  const updateSalesListAfterDelete = (deletedSaleId: string) => {
    setSales((prevSales) => prevSales.filter((sale) => sale.id !== deletedSaleId));
  };

  const updateSalesListAfterSave = (sale: Sale, isNew: boolean) => {
    if (isNew) {
      setSales(prevSales => [sale, ...prevSales]);
    } else {
      setSales(prevSales => 
        prevSales.map(prevSale => 
          prevSale.id === sale.id ? sale : prevSale
        )
      );
    }
  };

  // Fetch sales when user changes
  useEffect(() => {
    // Reset mounted state when component mounts
    isMountedRef.current = true;
    
    if (user) {
      console.log("Authenticated user, fetching sales");
      fetchSales();
    } else {
      console.log("No authenticated user, skipping sales fetch");
      setLoading(false);
    }
    
    // Reset mount status on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [user]);
  
  return {
    sales,
    loading,
    fetchSales,
    updateSalesListAfterDelete,
    updateSalesListAfterSave
  };
};
