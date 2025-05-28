
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Vendas
        </h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as vendas e comissões da equipe.
        </p>
      </motion.div>
      
      <motion.div 
        className="flex gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={onAddSale}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </motion.div>
        
        {isAdmin && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              onClick={handleImportClick}
              className="border-border/40 hover:border-border bg-background/50 backdrop-blur-sm hover:bg-background"
            >
              <Upload className="mr-2 h-4 w-4" />
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
