
import { useState, useEffect } from "react";
import { Sale } from "@/lib/types";
import { PaginatedSalesTable } from "./PaginatedSalesTable";
import { SalesFilter } from "./SalesFilter";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

interface SalesContentProps {
  loading: boolean;
  sales: Sale[];
  isSalesperson: boolean;
  onEdit: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
  onAddSale: () => void;
  onImport?: (file: File) => void;
}

export function SalesContent({ 
  loading, 
  sales, 
  isSalesperson,
  onEdit, 
  onDelete,
  onAddSale,
  onImport
}: SalesContentProps) {
  const [filteredSales, setFilteredSales] = useState<Sale[]>(sales);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // When sales prop changes, update filteredSales
  useEffect(() => {
    if (sales) {
      setFilteredSales(searchTerm ? 
        filteredSales : 
        sales
      );
    }
  }, [sales]);
  
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="flex-1 w-full">
            <SalesFilter 
              sales={sales} 
              onFilter={setFilteredSales}
              onSearch={setSearchTerm}
              hideButtons={true}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={onAddSale}
              className="flex-1 sm:flex-none"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
            
            {isAdmin && onImport && (
              <Button 
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.xlsx,.xls';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      onImport(target.files[0]);
                    }
                  };
                  input.click();
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Importar
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <PaginatedSalesTable
            sales={filteredSales}
            showSalesperson={!isSalesperson}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
