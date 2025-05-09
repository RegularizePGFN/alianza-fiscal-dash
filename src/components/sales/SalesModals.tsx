
import { Sale } from "@/lib/types";
import { SaleFormModal } from "@/components/sales/form/SaleFormModal";
import { DeleteSaleDialog } from "@/components/sales/DeleteSaleDialog";
import { useEffect } from "react";

interface SalesModalsProps {
  editingSale: Sale | null;
  saleToDelete: string | null;
  isProcessingAction: boolean;
  showSaleModal: boolean;
  onSave: (saleData: Omit<Sale, 'id'>) => void;
  onFormCancel: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}

export function SalesModals({
  editingSale,
  saleToDelete,
  isProcessingAction,
  showSaleModal,
  onSave,
  onFormCancel,
  onDeleteCancel,
  onDeleteConfirm
}: SalesModalsProps) {
  // Log para verificar visibilidade do modal
  useEffect(() => {
    console.log("SalesModals render - showSaleModal:", showSaleModal, "saleToDelete:", !!saleToDelete);
  }, [showSaleModal, saleToDelete]);

  return (
    <>
      {/* Only render the SaleFormModal when showSaleModal is true to avoid unnecessary processing */}
      {showSaleModal && (
        <SaleFormModal
          key={editingSale?.id || "new-sale"} 
          initialData={editingSale}
          onSave={onSave}
          onCancel={onFormCancel}
          isSubmitting={isProcessingAction}
          open={showSaleModal}
        />
      )}
      
      <DeleteSaleDialog
        isOpen={!!saleToDelete}
        onClose={onDeleteCancel}
        onDelete={onDeleteConfirm}
        isDeleting={isProcessingAction}
      />
    </>
  );
}
