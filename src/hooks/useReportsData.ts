
import { useState, useEffect } from "react";
import { Sale, DateFilter, PaymentMethod } from "@/lib/types";
import { useSales } from "@/hooks/sales"; // Correct import path
import { parseISODateString } from "@/lib/utils";

interface UseReportsDataProps {
  salespersonId: string | null;
  paymentMethod: PaymentMethod | null;
  dateFilter: DateFilter | null;
}

export const useReportsData = ({ 
  salespersonId, 
  paymentMethod, 
  dateFilter 
}: UseReportsDataProps) => {
  const { sales, loading } = useSales();
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      console.log("Filtering sales with filters:", { salespersonId, paymentMethod, dateFilter });
      console.log("Total sales before filtering:", sales.length);
      
      // Filter the sales data based on the provided filters
      let filtered = [...sales];
      
      // Filter by salesperson
      if (salespersonId) {
        filtered = filtered.filter(sale => sale.salesperson_id === salespersonId);
        console.log(`After salesperson filter (${salespersonId}):`, filtered.length);
      }
      
      // Filter by payment method
      if (paymentMethod) {
        filtered = filtered.filter(sale => sale.payment_method === paymentMethod);
        console.log(`After payment method filter (${paymentMethod}):`, filtered.length);
      }
      
      // Filter by date range
      if (dateFilter?.startDate && dateFilter?.endDate) {
        // Format dates to YYYY-MM-DD strings for comparison
        const startDate = dateFilter.startDate instanceof Date ? 
          dateFilter.startDate.toISOString().split('T')[0] : 
          (typeof dateFilter.startDate === 'string' ? dateFilter.startDate : '');
        
        const endDate = dateFilter.endDate instanceof Date ? 
          dateFilter.endDate.toISOString().split('T')[0] : 
          (typeof dateFilter.endDate === 'string' ? dateFilter.endDate : '');
        
        console.log("Filtering by date range:", startDate, "to", endDate);
        
        filtered = filtered.filter(sale => {
          // Ensure sale.sale_date is in YYYY-MM-DD format
          if (typeof sale.sale_date !== 'string' || !sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return false;
          }
          
          // Compare dates as strings in YYYY-MM-DD format for exact matching
          return sale.sale_date >= startDate && sale.sale_date <= endDate;
        });
        
        console.log("After date filter:", filtered.length);
      }
      
      setFilteredSales(filtered);
    } catch (err) {
      console.error("Error filtering sales data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error filtering data"));
    }
  }, [sales, salespersonId, paymentMethod, dateFilter]);

  return {
    salesData: filteredSales,
    loading,
    error
  };
};
