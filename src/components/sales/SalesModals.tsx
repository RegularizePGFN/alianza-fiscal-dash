
import { Sale } from "@/lib/types";
import { SaleFormModal } from "@/components/sales/form/SaleFormModal";
import { DeleteSaleDialog } from "@/components/sales/DeleteSaleDialog";

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
  return (
    <>
      {/* Always render the SaleFormModal and control visibility via open prop */}
      <SaleFormModal
        key={editingSale?.id || "new-sale"} 
        initialData={editingSale}
        onSave={onSave}
        onCancel={onFormCancel}
        isSubmitting={isProcessingAction}
        open={showSaleModal}
      />
      
      {/* Always render DeleteSaleDialog and control visibility via isOpen prop */}
      <DeleteSaleDialog
        isOpen={!!saleToDelete}
        onClose={onDeleteCancel}
        onDelete={onDeleteConfirm}
        isDeleting={isProcessingAction}
      />
    </>
  );
}
