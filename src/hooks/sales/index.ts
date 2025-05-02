
import { useState } from "react";
import { Sale } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { useFetchSales } from "./useFetchSales";
import { useDeleteSale } from "./useDeleteSale";
import { useSaveSale } from "./useSaveSale";

export const useSales = () => {
  const { user } = useAuth();
  
  const {
    sales,
    loading,
    fetchSales,
    updateSalesListAfterDelete,
    updateSalesListAfterSave
  } = useFetchSales(user);
  
  const { handleDeleteSale } = useDeleteSale(updateSalesListAfterDelete);
  const { handleSaveSale } = useSaveSale(updateSalesListAfterSave);
  
  return {
    sales,
    loading,
    fetchSales,
    handleDeleteSale,
    handleSaveSale
  };
};
