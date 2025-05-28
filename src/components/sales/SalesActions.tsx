
import { PlusCircle, FileUp, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportButton } from "./filters/ImportButton";
import { ExportButton } from "./filters/ExportButton";
import { motion } from "framer-motion";

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
      className="flex space-x-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddSale}
          className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
        >
          <PlusCircle className="h-4 w-4" />
          Nova Venda
        </Button>
      </motion.div>
      
      {isAdmin && onImport && (
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ImportButton onImport={onImport} />
        </motion.div>
      )}
      
      {onExport && (
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="hidden md:flex gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
          >
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
