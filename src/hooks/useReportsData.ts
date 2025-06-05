
import { useState, useEffect } from "react";
import { Sale, DateFilter, PaymentMethod } from "@/lib/types";
import { useSales } from "@/hooks/sales";

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
      console.log("useReportsData - Filtering sales with filters:", { 
        salespersonId, 
        paymentMethod, 
        dateFilter: dateFilter ? {
          startDate: dateFilter.startDate instanceof Date ? dateFilter.startDate.toISOString().split('T')[0] : dateFilter.startDate,
          endDate: dateFilter.endDate instanceof Date ? dateFilter.endDate.toISOString().split('T')[0] : dateFilter.endDate
        } : null
      });
      console.log("useReportsData - Total sales before filtering:", sales.length);
      
      // Start with all sales
      let filtered = [...sales];
      
      // Filter by salesperson
      if (salespersonId) {
        filtered = filtered.filter(sale => sale.salesperson_id === salespersonId);
        console.log(`useReportsData - After salesperson filter (${salespersonId}):`, filtered.length);
      }
      
      // Filter by payment method
      if (paymentMethod) {
        filtered = filtered.filter(sale => sale.payment_method === paymentMethod);
        console.log(`useReportsData - After payment method filter (${paymentMethod}):`, filtered.length);
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
        
        console.log("useReportsData - Filtering by date range:", startDate, "to", endDate);
        
        const beforeDateFilter = filtered.length;
        filtered = filtered.filter(sale => {
          // Ensure sale.sale_date is in YYYY-MM-DD format
          if (typeof sale.sale_date !== 'string' || !sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            console.warn(`Invalid sale date format: ${sale.sale_date} for sale ${sale.id}`);
            return false;
          }
          
          // Compare dates as strings in YYYY-MM-DD format for exact matching
          const isInRange = sale.sale_date >= startDate && sale.sale_date <= endDate;
          if (!isInRange) {
            console.log(`Sale ${sale.id} with date ${sale.sale_date} is outside range ${startDate} to ${endDate}`);
          }
          return isInRange;
        });
        
        console.log(`useReportsData - After date filter: ${filtered.length} (removed ${beforeDateFilter - filtered.length} sales)`);
      } else {
        console.log("useReportsData - No date filter applied, showing all sales");
      }
      
      console.log("useReportsData - Final filtered sales count:", filtered.length);
      console.log("useReportsData - Sample of filtered sales:", filtered.slice(0, 3).map(s => ({
        id: s.id,
        date: s.sale_date,
        amount: s.gross_amount,
        method: s.payment_method
      })));
      
      setFilteredSales(filtered);
    } catch (err) {
      console.error("useReportsData - Error filtering sales data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error filtering data"));
    }
  }, [sales, salespersonId, paymentMethod, dateFilter]);

  return {
    salesData: filteredSales,
    loading,
    error
  };
};
