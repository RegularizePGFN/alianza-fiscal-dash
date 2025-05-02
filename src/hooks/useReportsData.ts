
import { useState, useEffect } from "react";
import { Sale, DateFilter, PaymentMethod } from "@/lib/types";
import { useSales } from "@/hooks/sales"; // Updated import path from @/hooks/useSales to @/hooks/sales

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
      // Filter the sales data based on the provided filters
      let filtered = [...sales];
      
      // Filter by salesperson
      if (salespersonId) {
        filtered = filtered.filter(sale => sale.salesperson_id === salespersonId);
      }
      
      // Filter by payment method
      if (paymentMethod) {
        filtered = filtered.filter(sale => sale.payment_method === paymentMethod);
      }
      
      // Filter by date range
      if (dateFilter?.startDate && dateFilter?.endDate) {
        const start = new Date(dateFilter.startDate);
        // Set end date to end of day to include all sales on the end date
        const end = new Date(dateFilter.endDate);
        end.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.sale_date);
          return saleDate >= start && saleDate <= end;
        });
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
