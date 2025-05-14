
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SalesActionsProps {
  isAdmin: boolean;
  onAddSale: () => void;
  onImport?: (file: File) => void;
}

export function SalesActions({ isAdmin, onAddSale, onImport }: SalesActionsProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
      // Reset the input value to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onAddSale} size="icon" aria-label="Nova Venda">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Nova Venda</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isAdmin && onImport && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleImportClick}
                aria-label="Importar Vendas"
              >
                <FileUp className="h-4 w-4" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Importar Vendas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
