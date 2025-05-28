
import { Plus, Upload, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ImportButton } from "./filters/ImportButton";

interface SalesActionsProps {
  isAdmin: boolean;
  onAddSale: () => void;
  onImport?: (file: File) => void;
  onExport?: () => void;
}

export function SalesActions({ 
  isAdmin, 
  onAddSale, 
  onImport,
  onExport
}: SalesActionsProps) {
  return (
    <motion.div 
      className="flex gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="default" 
          size="sm" 
          onClick={onAddSale}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </motion.div>
      
      {isAdmin && onImport && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ImportButton onImport={onImport} />
        </motion.div>
      )}
      
      {onExport && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="hidden md:flex border-border/40 hover:border-border bg-background/50 backdrop-blur-sm hover:bg-background"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
