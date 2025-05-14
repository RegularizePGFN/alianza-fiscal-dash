
import { useState, useEffect } from "react";
import { Sale } from "@/lib/types";
import { PaginatedSalesTable } from "./PaginatedSalesTable";
import { SalesFilter } from "./SalesFilter";
import { SalesActions } from "./SalesActions";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Vendas</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie vendas e comissões da sua equipe
        </p>
      </div>

      {!loading && (
        <Card className="shadow-sm border-0 p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        </Card>
      )}
      
      <Card className="shadow-sm border-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <PaginatedSalesTable
            sales={filteredSales}
            showSalesperson={!isSalesperson}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </Card>
    </div>
  );
}
