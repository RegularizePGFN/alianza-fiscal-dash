
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { PlusCircle, FileUp, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SalesHeaderProps {
  isAdmin: boolean;
  onAddSale: () => void;
  sales: any[];
  onImport: (file: File) => void;
}

export function SalesHeader({ isAdmin, onAddSale, sales, onImport }: SalesHeaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset the input value to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <motion.div 
      className="flex justify-between items-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ShoppingCart className="h-6 w-6" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Vendas
          </h2>
        </div>
        <p className="text-muted-foreground">
          Gerencie as vendas e comissões da equipe.
        </p>
      </div>
      
      <motion.div 
        className="flex gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={onAddSale}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Venda
          </Button>
        </motion.div>
        
        {isAdmin && (
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="outline" 
              onClick={handleImportClick}
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
            >
              <FileUp className="h-4 w-4" />
              Importar
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
