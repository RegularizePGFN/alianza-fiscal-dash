
import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sale, UserRole, PaymentMethod } from "@/lib/types";
import { useAuth } from "@/contexts/auth";
import { useSales } from "@/hooks/sales";
import { useToast } from "@/hooks/use-toast";
import { importSalesFromExcel } from "@/lib/excelUtils";
import { SalesContent } from "@/components/sales/SalesContent";
import { SalesModals } from "@/components/sales/SalesModals";

export default function SalesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sales, loading, handleDeleteSale, handleSaveSale, fetchSales } =
    useSales();

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  /* ---------------------- handlers ---------------------- */
  const handleAddSale = useCallback(() => {
    if (isProcessingAction) return;
    setEditingSale(null);
    setShowSaleModal(true);
  }, [isProcessingAction]);

  const handleEdit = useCallback(
    (sale: Sale) => {
      if (isProcessingAction) return;
      console.log("Editing sale:", sale);
      setEditingSale({...sale}); // Make a copy to prevent reference issues
      setShowSaleModal(true);
    },
    [isProcessingAction]
  );

  const handleDeleteConfirm = useCallback(
    (saleId: string) => {
      if (isProcessingAction) return;
      setSaleToDelete(saleId);
    },
    [isProcessingAction]
  );

  const handleDeleteCancel = useCallback(() => {
    if (!isProcessingAction) setSaleToDelete(null);
  }, [isProcessingAction]);

  const handleDeleteSaleConfirm = useCallback(async () => {
    if (!saleToDelete) return;
    setIsProcessingAction(true);
    const success = await handleDeleteSale(saleToDelete);
    setIsProcessingAction(false);
    if (success) {
      setSaleToDelete(null);
      toast({ title: "Venda excluída" });
      fetchSales();
    }
  }, [saleToDelete, handleDeleteSale, toast, fetchSales]);

  const handleSaveSaleForm = useCallback(
    async (saleData: Omit<Sale, "id">) => {
      try {
        console.log("Saving sale from form:", saleData);
        setIsProcessingAction(true);
        const success = await handleSaveSale(saleData, editingSale?.id);
        setIsProcessingAction(false);

        if (success) {
          console.log("Sale saved successfully");
          fetchSales();
          setShowSaleModal(false);
          setEditingSale(null);
          toast({
            title: editingSale ? "Venda atualizada" : "Venda adicionada",
          });
        } else {
          console.error("Failed to save sale");
        }
      } catch (error) {
        console.error("Error in handleSaveSaleForm:", error);
        setIsProcessingAction(false);
        toast({
          title: "Erro ao salvar a venda",
          description: "Ocorreu um erro inesperado",
          variant: "destructive"
        });
      }
    },
    [editingSale, handleSaveSale, fetchSales, toast]
  );

  const handleFormCancel = useCallback(() => {
    if (!isProcessingAction) {
      setShowSaleModal(false);
      setEditingSale(null);
    }
  }, [isProcessingAction]);

  const handleImport = useCallback(async (file: File) => {
    try {
      setIsProcessingAction(true);
      const salesData = await importSalesFromExcel(file);
      
      if (salesData && salesData.length > 0) {
        let successCount = 0;
        
        // Process each sale
        for (const partialSale of salesData) {
          // Ensure required fields are present and provide defaults for missing ones
          const sale: Omit<Sale, "id"> = {
            salesperson_id: partialSale.salesperson_id || user?.id || '', // Use current user if not specified
            salesperson_name: partialSale.salesperson_name || user?.name || 'Unknown',
            gross_amount: partialSale.gross_amount || 0,
            net_amount: partialSale.net_amount || partialSale.gross_amount || 0,
            payment_method: (partialSale.payment_method as PaymentMethod) || PaymentMethod.PIX,
            installments: partialSale.installments || 1,
            sale_date: partialSale.sale_date || new Date().toISOString().split('T')[0],
            client_name: partialSale.client_name || 'Client',
            client_phone: partialSale.client_phone || '',
            client_document: partialSale.client_document || '',
          };
          
          const success = await handleSaveSale(sale);
          if (success) successCount++;
        }
        
        // Refresh sales list
        fetchSales();
        
        // Show success/error message
        if (successCount > 0) {
          toast({
            title: "Importação concluída",
            description: `${successCount} de ${salesData.length} vendas foram importadas.`,
          });
        } else {
          toast({
            title: "Falha na importação",
            description: "Nenhuma venda foi importada.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Arquivo inválido",
          description: "O arquivo não contém dados de vendas válidos.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error importing sales:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar as vendas.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  }, [handleSaveSale, fetchSales, toast, user]);

  /* ---------------------- render ---------------------- */
  const isAdmin = user?.role === UserRole.ADMIN;
  const isSalesperson = user?.role === UserRole.SALESPERSON;

  return (
    <AppLayout>
      <div className="space-y-6">
        <SalesContent
          loading={loading}
          sales={sales}
          isSalesperson={isSalesperson}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirm}
          onAddSale={handleAddSale}
          onImport={handleImport}
          isAdmin={isAdmin}
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
