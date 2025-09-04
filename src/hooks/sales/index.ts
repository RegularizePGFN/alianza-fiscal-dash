
import { useState } from "react";
import { Sale } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { useFetchSales } from "./useFetchSales";
import { useDeleteSale } from "./useDeleteSale";
import { useSaveSale } from "./useSaveSale";
import { useCommissionSync } from "@/hooks/financeiro/useCommissionSync";

export const useSales = () => {
  const { user } = useAuth();
  
  const {
    sales,
    loading,
    fetchSales,
    updateSalesListAfterDelete,
    updateSalesListAfterSave
  } = useFetchSales(user);

  // Sincronizar comissões quando vendas mudarem
  const { syncCommissionsForAllMonths } = useCommissionSync();

  const { handleDeleteSale } = useDeleteSale(updateSalesListAfterDelete);
  const { handleSaveSale } = useSaveSale(updateSalesListAfterSave);
  
  // Wrapper para delete que sincroniza comissões
  const handleDeleteSaleWithSync = async (saleId: string): Promise<boolean> => {
    const result = await handleDeleteSale(saleId);
    if (result) {
      // Sincronizar comissões após deletar venda
      setTimeout(() => syncCommissionsForAllMonths(), 500);
    }
    return result;
  };

  // Wrapper para save que sincroniza comissões
  const handleSaveSaleWithSync = async (
    saleData: Omit<Sale, "id">, 
    editingSaleId?: string
  ): Promise<boolean> => {
    const result = await handleSaveSale(saleData, editingSaleId);
    if (result) {
      // Sincronizar comissões após salvar venda
      setTimeout(() => syncCommissionsForAllMonths(), 500);
    }
    return result;
  };
  
  return {
    sales,
    loading,
    fetchSales,
    handleDeleteSale: handleDeleteSaleWithSync,
    handleSaveSale: handleSaveSaleWithSync
  };
};
