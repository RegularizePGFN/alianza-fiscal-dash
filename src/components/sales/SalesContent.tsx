
import { useState } from "react";
import { Sale } from "@/lib/types";
import { PaginatedSalesTable } from "./PaginatedSalesTable";
import { SalesFilter } from "./SalesFilter";

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
  const [filteredSales, setFilteredSales] = useState<Sale[]>(sales);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // When sales prop changes, update filteredSales
  if (sales !== filteredSales && searchTerm === "") {
    setFilteredSales(sales);
  }
  
  return (
    <div className="space-y-4">
      {!loading && (
        <SalesFilter 
          sales={sales} 
          onFilter={setFilteredSales}
          onSearch={setSearchTerm}
        />
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
