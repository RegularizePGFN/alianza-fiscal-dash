
import { useState, useEffect } from "react";
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

  useEffect(() => {
    try {
      console.log("Total sales for reports:", sales.length);
      // Sem filtros, usamos todos os dados de vendas
      setFilteredSales(sales);
    } catch (err) {
      console.error("Error processing sales data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error processing data"));
    }
  }, [sales]);

  return {
    salesData: filteredSales,
    loading,
    error
  };
};
