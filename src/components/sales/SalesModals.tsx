
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
  // O problema está no gerenciamento do state dos modais.
  // Não devemos renderizar modais condicionalmente quando eles têm estado interno.
  // Isso causa problemas quando o modal é fechado e depois reaberto.
  
  return (
    <>
      {/* Sempre renderizamos o SaleFormModal, mas controlamos sua visibilidade com a prop open */}
      <SaleFormModal
        key={editingSale?.id || "new-sale" + (showSaleModal ? "-open" : "-closed")}
        initialData={editingSale}
        onSave={onSave}
        onCancel={onFormCancel}
        isSubmitting={isProcessingAction}
        open={showSaleModal}
      />
      
      {/* O mesmo para DeleteSaleDialog */}
      <DeleteSaleDialog
        isOpen={!!saleToDelete}
        onClose={onDeleteCancel}
        onDelete={onDeleteConfirm}
        isDeleting={isProcessingAction}
      />
    </>
  );
}
