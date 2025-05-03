
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
      {/* Only render the form modal when it's needed */}
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

      {saleToDelete && (
        <DeleteSaleDialog
          isOpen={!!saleToDelete}
          onClose={onDeleteCancel}
          onDelete={onDeleteConfirm}
          isDeleting={isProcessingAction}
        />
      )}
    </>
  );
}
