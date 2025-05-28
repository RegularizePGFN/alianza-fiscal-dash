
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sale } from "@/lib/types";
import { PaginatedSalesTable } from "./PaginatedSalesTable";
import { SalesFilter } from "./SalesFilter";
import { SalesActions } from "./SalesActions";
import { exportSalesToExcel } from "@/lib/excelUtils";

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

  // Handle export of filtered sales data
  const handleExport = () => {
    console.log(`Exporting ${filteredSales.length} sales records`);
    exportSalesToExcel(filteredSales);
  };
  
  return (
    <div className="space-y-6">
      {!loading && (
        <motion.div 
          className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm rounded-xl shadow-sm border border-border/40 p-6 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col space-y-6">
            <motion.div 
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Vendas
              </h2>
            </motion.div>
            
            <motion.div 
              className="flex flex-col md:flex-row justify-between gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
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
                  onExport={handleExport}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="bg-gradient-to-br from-background to-background/50 backdrop-blur-sm rounded-xl shadow-sm border border-border/40 overflow-hidden transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div 
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-sm text-muted-foreground">Carregando dados...</p>
            </motion.div>
          </div>
        ) : (
          <PaginatedSalesTable
            sales={filteredSales}
            showSalesperson={!isSalesperson}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </motion.div>
    </div>
  );
}
