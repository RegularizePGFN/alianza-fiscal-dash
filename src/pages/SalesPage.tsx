
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesTable } from "@/components/sales/SalesTable";
import { Sale, UserRole } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { SaleFormModal } from "@/components/sales/SaleFormModal";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { DeleteSaleDialog } from "@/components/sales/DeleteSaleDialog";
import { useSales } from "@/hooks/useSales";

export default function SalesPage() {
  const { user } = useAuth();
  const { sales, loading, handleDeleteSale, handleSaveSale } = useSales();
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  
  const handleAddSale = () => {
    setEditingSale(null);
    setShowSaleModal(true);
  };
  
  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowSaleModal(true);
  };
  
  const handleDeleteConfirm = (saleId: string) => {
    setSaleToDelete(saleId);
  };
  
  const handleDeleteCancel = () => {
    setSaleToDelete(null);
  };
  
  const handleDeleteSaleConfirm = async () => {
    if (!saleToDelete) return;
    
    const success = await handleDeleteSale(saleToDelete);
    if (success) {
      setSaleToDelete(null);
    }
  };
  
  const handleSaveSaleForm = async (saleData: Omit<Sale, 'id'>) => {
    const success = await handleSaveSale(saleData, editingSale?.id);
    
    if (success) {
      setShowSaleModal(false);
    }
  };
  
  const isAdmin = user?.role === UserRole.ADMIN;
  const isManager = user?.role === UserRole.MANAGER;
  const isSalesperson = user?.role === UserRole.SALESPERSON;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <SalesHeader 
          isAdmin={isAdmin} 
          isManager={isManager} 
          onAddSale={handleAddSale} 
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
            onCancel={() => setShowSaleModal(false)}
          />
        )}
        
        <DeleteSaleDialog
          isOpen={!!saleToDelete}
          onClose={handleDeleteCancel}
          onDelete={handleDeleteSaleConfirm}
        />
      </div>
    </AppLayout>
  );
}
