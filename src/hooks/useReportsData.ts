
import { useState, useEffect } from "react";
import { Sale, DateFilter, PaymentMethod } from "@/lib/types";
import { useSales } from "@/hooks/sales"; // Correct import path

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
        const start = new Date(dateFilter.startDate);
        // Set end date to end of day to include all sales on the end date
        const end = new Date(dateFilter.endDate);
        end.setHours(23, 59, 59, 999);
        
        console.log("Filtering by date range:", start, "to", end);
        
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.sale_date);
          const isInRange = saleDate >= start && saleDate <= end;
          if (!isInRange) {
            console.log("Sale outside date range:", sale.sale_date, saleDate);
          }
          return isInRange;
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
