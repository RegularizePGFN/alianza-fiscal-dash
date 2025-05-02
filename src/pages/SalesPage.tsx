
import { useState, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesTable } from "@/components/sales/SalesTable";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { SaleFormModal } from "@/components/sales/form/SaleFormModal";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { DeleteSaleDialog } from "@/components/sales/DeleteSaleDialog";
import { useSales } from "@/hooks/sales";
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
  
  // Reset processing state if modal is closed externally
  useEffect(() => {
    if (!showSaleModal && !saleToDelete) {
      setIsProcessingAction(false);
    }
  }, [showSaleModal, saleToDelete]);
  
  const handleAddSale = useCallback(() => {
    setEditingSale(null);
    setShowSaleModal(true);
  }, []);
  
  const handleEdit = useCallback((sale: Sale) => {
    setEditingSale(sale);
    setShowSaleModal(true);
  }, []);
  
  const handleDeleteConfirm = useCallback((saleId: string) => {
    setSaleToDelete(saleId);
  }, []);
  
  const handleDeleteCancel = useCallback(() => {
    if (!isProcessingAction) {
      setSaleToDelete(null);
    }
  }, [isProcessingAction]);
  
  const handleDeleteSaleConfirm = useCallback(async () => {
    if (!saleToDelete) return;
    
    setIsProcessingAction(true);
    try {
      const success = await handleDeleteSale(saleToDelete);
      if (success) {
        setSaleToDelete(null);
        toast({
          title: "Venda excluída",
          description: "A venda foi excluída com sucesso.",
        });
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a venda. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  }, [saleToDelete, handleDeleteSale, toast]);
  
  const handleSaveSaleForm = useCallback(async (saleData: Omit<Sale, 'id'>) => {
    setIsProcessingAction(true);
    try {
      const success = await handleSaveSale(saleData, editingSale?.id);
      
      if (success) {
        setShowSaleModal(false);
        setEditingSale(null);
        toast({
          title: editingSale ? "Venda atualizada" : "Venda adicionada",
          description: editingSale 
            ? "A venda foi atualizada com sucesso." 
            : "Nova venda registrada com sucesso.",
        });
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a venda. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAction(false);
    }
  }, [editingSale, handleSaveSale, toast]);
  
  const handleFormCancel = useCallback(() => {
    if (!isProcessingAction) {
      setShowSaleModal(false);
      setEditingSale(null);
    }
  }, [isProcessingAction]);

  const handleImportSales = useCallback(async (file: File) => {
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
      
      // Import sales in batches to prevent UI freezing
      const processSalesBatch = async (batchIndex: number, batchSize: number) => {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, totalSales);
        
        for (let i = startIndex; i < endIndex; i++) {
          const success = await handleSaveSale(salesData[i]);
          if (success) successCount++;
        }
        
        // If there are more batches to process
        if (endIndex < totalSales) {
          // Update progress toast
          toast({
            title: "Importando vendas",
            description: `Processando ${endIndex} de ${totalSales} vendas...`,
          });
          
          // Process next batch with a small delay to allow UI updates
          setTimeout(() => processSalesBatch(batchIndex + 1, batchSize), 100);
        } else {
          // All batches processed
          fetchSales();
          
          toast({
            title: "Importação concluída",
            description: `${successCount} de ${totalSales} vendas importadas com sucesso.`,
            variant: successCount === totalSales ? "default" : "destructive"
          });
          
          setIsProcessingAction(false);
        }
      };
      
      // Start processing in batches of 5
      processSalesBatch(0, 5);
      
    } catch (error) {
      console.error("Error importing sales:", error);
      toast({
        title: "Erro na importação",
        description: "Houve um erro ao importar as vendas. Verifique o formato do arquivo.",
        variant: "destructive"
      });
      setIsProcessingAction(false);
    }
  }, [handleSaveSale, fetchSales, toast]);
  
  const isAdmin = user?.role === UserRole.ADMIN;
  const isSalesperson = user?.role === UserRole.SALESPERSON;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <SalesHeader 
            isAdmin={isAdmin} 
            onAddSale={handleAddSale}
            sales={sales}
            onImport={handleImportSales}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <SalesTable
              sales={sales}
              showSalesperson={!isSalesperson}
              onEdit={handleEdit}
              onDelete={handleDeleteConfirm}
            />
          )}
        </div>
        
        {/* Render modals only when needed */}
        {showSaleModal && (
          <SaleFormModal 
            initialData={editingSale}
            onSave={handleSaveSaleForm}
            onCancel={handleFormCancel}
            isSubmitting={isProcessingAction}
          />
        )}
        
        {saleToDelete && (
          <DeleteSaleDialog
            isOpen={!!saleToDelete}
            onClose={handleDeleteCancel}
            onDelete={handleDeleteSaleConfirm}
            isDeleting={isProcessingAction}
          />
        )}
      </div>
    </AppLayout>
  );
}
