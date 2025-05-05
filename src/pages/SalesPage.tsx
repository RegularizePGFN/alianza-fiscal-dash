
// SalesPage.tsx
import { useState, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { useSales } from "@/hooks/sales";
import { useToast } from "@/hooks/use-toast";
import { importSalesFromExcel } from "@/lib/excelUtils";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { SalesContent } from "@/components/sales/SalesContent";
import { SalesModals } from "@/components/sales/SalesModals";
import { SalesActions } from "@/components/sales/SalesActions";

export default function SalesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sales, loading, handleDeleteSale, handleSaveSale, fetchSales } = useSales();

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Debugging log to track component rendering and state
  useEffect(() => {
    console.log("SalesPage rendered with state:", {
      showSaleModal,
      editingSale: editingSale?.id || 'none',
      saleToDelete,
      isProcessingAction,
      salesCount: sales.length
    });
  }, [showSaleModal, editingSale, saleToDelete, isProcessingAction, sales.length]);

  const handleAddSale = useCallback(() => {
    if (!isProcessingAction) {
      console.log("Add sale button clicked");
      setEditingSale(null);
      setShowSaleModal(true);
    }
  }, [isProcessingAction]);

  const handleEdit = useCallback((sale: Sale) => {
    if (!isProcessingAction) {
      console.log("Edit sale clicked for:", sale.id);
      setEditingSale(sale);
      setShowSaleModal(true);
    }
  }, [isProcessingAction]);

  const handleDeleteConfirm = useCallback((saleId: string) => {
    if (!isProcessingAction) {
      console.log("Delete confirmation requested for sale:", saleId);
      setSaleToDelete(saleId);
    }
  }, [isProcessingAction]);

  const handleDeleteCancel = useCallback(() => {
    if (!isProcessingAction) {
      console.log("Delete operation cancelled");
      setSaleToDelete(null);
    }
  }, [isProcessingAction]);

  const handleDeleteSaleConfirm = useCallback(async () => {
    if (!saleToDelete) return;
    console.log("Proceeding with deletion of sale:", saleToDelete);
    setIsProcessingAction(true);
    try {
      const success = await handleDeleteSale(saleToDelete);
      if (success) {
        setSaleToDelete(null);
        toast({
          title: "Venda excluída",
          description: "A venda foi excluída com sucesso.",
        });
        console.log("Sale deleted successfully");
      }
    } catch (error) {
      console.error("Error during delete operation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a venda.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  }, [saleToDelete, handleDeleteSale, toast]);

  const handleSaveSaleForm = useCallback(async (saleData: Omit<Sale, 'id'>) => {
    console.log("Save sale form handler triggered with data:", saleData);
    setIsProcessingAction(true);
    try {
      const success = await handleSaveSale(saleData, editingSale?.id);
      console.log("Save operation result:", success);
      if (success) {
        setShowSaleModal(false);
        setEditingSale(null);
        toast({
          title: editingSale ? "Venda atualizada" : "Venda adicionada",
          description: editingSale ? "A venda foi atualizada." : "Nova venda registrada.",
        });
        console.log("Sale saved successfully");
      } else {
        console.log("Save operation unsuccessful but no error thrown");
      }
    } catch (error) {
      console.error("Error during save operation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a venda.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  }, [editingSale, handleSaveSale, toast]);

  const handleFormCancel = useCallback(() => {
    if (!isProcessingAction) {
      console.log("Form cancel requested");
      setShowSaleModal(false);
      setEditingSale(null);
    }
  }, [isProcessingAction]);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isSalesperson = user?.role === UserRole.SALESPERSON;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
              <p className="text-muted-foreground">
                Gerencie as vendas e comissões da equipe.
              </p>
            </div>
            <SalesActions 
              isAdmin={isAdmin} 
              onAddSale={handleAddSale} 
              onImport={() => {}} 
            />
          </div>
        </div>

        <SalesContent
          loading={loading}
          sales={sales}
          isSalesperson={isSalesperson}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirm}
        />

        <SalesModals
          editingSale={editingSale}
          saleToDelete={saleToDelete}
          isProcessingAction={isProcessingAction}
          showSaleModal={showSaleModal}
          onSave={handleSaveSaleForm}
          onFormCancel={handleFormCancel}
          onDeleteCancel={handleDeleteCancel}
          onDeleteConfirm={handleDeleteSaleConfirm}
        />
      </div>
    </AppLayout>
  );
}
