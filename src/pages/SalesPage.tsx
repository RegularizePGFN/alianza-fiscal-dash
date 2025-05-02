
import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesTable } from "@/components/sales/SalesTable";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { SaleFormModal } from "@/components/sales/form/SaleFormModal";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { DeleteSaleDialog } from "@/components/sales/DeleteSaleDialog";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";
import { importSalesFromExcel } from "@/lib/excelUtils";

export default function SalesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sales, loading, handleDeleteSale, handleSaveSale, fetchSales } = useSales();
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  const handleAddSale = () => {
    setEditingSale(null);
    setShowSaleModal(true);
  };
  
  const handleEdit = useCallback((sale: Sale) => {
    setEditingSale(sale);
    setShowSaleModal(true);
  }, []);
  
  const handleDeleteConfirm = useCallback((saleId: string) => {
    setSaleToDelete(saleId);
  }, []);
  
  const handleDeleteCancel = () => {
    setSaleToDelete(null);
  };
  
  const handleDeleteSaleConfirm = async () => {
    if (!saleToDelete) return;
    
    setIsProcessingAction(true);
    try {
      const success = await handleDeleteSale(saleToDelete);
      if (success) {
        setSaleToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  };
  
  const handleSaveSaleForm = async (saleData: Omit<Sale, 'id'>) => {
    setIsProcessingAction(true);
    try {
      const success = await handleSaveSale(saleData, editingSale?.id);
      
      if (success) {
        setShowSaleModal(false);
        setEditingSale(null);
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Error",
        description: "There was an error saving the sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  };
  
  const handleFormCancel = useCallback(() => {
    if (!isProcessingAction) {
      setShowSaleModal(false);
      setEditingSale(null);
    }
  }, [isProcessingAction]);

  const handleImportSales = async (file: File) => {
    try {
      setIsProcessingAction(true);
      toast({
        title: "Processando importação",
        description: "Aguarde enquanto processamos o arquivo.",
      });
      
      const salesData = await importSalesFromExcel(file);
      
      if (!salesData || salesData.length === 0) {
        toast({
          title: "Importação vazia",
          description: "Não foram encontrados dados válidos no arquivo.",
          variant: "destructive"
        });
        return;
      }
      
      let successCount = 0;
      const totalSales = salesData.length;
      
      toast({
        title: "Importando vendas",
        description: `Importando ${totalSales} vendas...`,
      });
      
      // Import sales one by one
      for (const sale of salesData) {
        const success = await handleSaveSale(sale);
        if (success) successCount++;
      }
      
      // Refresh sales data
      fetchSales();
      
      toast({
        title: "Importação concluída",
        description: `${successCount} de ${totalSales} vendas importadas com sucesso.`,
        variant: successCount === totalSales ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error("Error importing sales:", error);
      toast({
        title: "Erro na importação",
        description: "Houve um erro ao importar as vendas. Verifique o formato do arquivo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };
  
  const isAdmin = user?.role === UserRole.ADMIN;
  const isSalesperson = user?.role === UserRole.SALESPERSON;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <SalesHeader 
          isAdmin={isAdmin} 
          onAddSale={handleAddSale}
          sales={sales}
          onImport={handleImportSales}
        />
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <SalesTable
            sales={sales}
            showSalesperson={!isSalesperson}
            onEdit={handleEdit}
            onDelete={handleDeleteConfirm}
          />
        )}
        
        {showSaleModal && (
          <SaleFormModal 
            initialData={editingSale}
            onSave={handleSaveSaleForm}
            onCancel={handleFormCancel}
            isSubmitting={isProcessingAction}
          />
        )}
        
        <DeleteSaleDialog
          isOpen={!!saleToDelete}
          onClose={handleDeleteCancel}
          onDelete={handleDeleteSaleConfirm}
          isDeleting={isProcessingAction}
        />
      </div>
    </AppLayout>
  );
}
