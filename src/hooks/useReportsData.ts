
import { useState, useEffect, useRef } from "react";
import { Sale } from "@/lib/types";
import { useSales } from "@/hooks/sales";

interface UseReportsDataProps {
  salespersonId: string | null;
  paymentMethod: string | null;
  dateFilter: any | null;
}

export const useReportsData = ({ 
  salespersonId, 
  paymentMethod, 
  dateFilter 
}: UseReportsDataProps) => {
  const { sales, loading } = useSales();
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [error, setError] = useState<Error | null>(null);
  // Add a reference to track whether initial filtering has been done
  const initialProcessingDoneRef = useRef(false);

  useEffect(() => {
    if (!loading && sales.length > 0 && !initialProcessingDoneRef.current) {
      try {
        console.log("Total sales for reports:", sales.length);
        // No filters, we use all sales data
        setFilteredSales(sales);
        initialProcessingDoneRef.current = true;
      } catch (err) {
        console.error("Error processing sales data:", err);
        setError(err instanceof Error ? err : new Error("Unknown error processing data"));
      }
    }
  }, [sales, loading]);

  return {
    salesData: filteredSales,
    loading,
    error
  };
};
