
import { Sale } from "@/lib/types";
import { SalesTable } from "@/components/sales/SalesTable";

interface SalesContentProps {
  loading: boolean;
  sales: Sale[];
  isSalesperson: boolean;
  onEdit: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
}

export function SalesContent({ 
  loading, 
  sales, 
  isSalesperson, 
  onEdit, 
  onDelete 
}: SalesContentProps) {
  return (
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
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
