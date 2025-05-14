
import { useState, useEffect } from "react";
import { Sale } from "@/lib/types";
import { PaginatedSalesTable } from "./PaginatedSalesTable";
import { SalesFilter } from "./SalesFilter";
import { SalesActions } from "./SalesActions";

interface SalesContentProps {
  loading: boolean;
  sales: Sale[];
  isSalesperson: boolean;
  onEdit: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
  onAddSale: () => void;
  onImport?: (file: File) => void;
  isAdmin: boolean;
}

export function SalesContent({ 
  loading, 
  sales, 
  isSalesperson, 
  onEdit, 
  onDelete,
  onAddSale,
  onImport,
  isAdmin
}: SalesContentProps) {
  const [filteredSales, setFilteredSales] = useState<Sale[]>(sales);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // When sales prop changes, update filteredSales
  useEffect(() => {
    if (sales && searchTerm === "") {
      setFilteredSales(sales);
    }
  }, [sales, searchTerm]);
  
  return (
    <div className="space-y-4">
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Vendas</h2>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <SalesFilter 
                  sales={sales} 
                  onFilter={setFilteredSales}
                  onSearch={setSearchTerm}
                />
              </div>
              <div className="flex justify-end">
                <SalesActions 
                  isAdmin={isAdmin} 
                  onAddSale={onAddSale} 
                  onImport={onImport}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
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
