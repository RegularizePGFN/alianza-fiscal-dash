
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      <Button onClick={onAddSale}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nova Venda
      </Button>
      
      {isAdmin && onImport && (
        <Button variant="outline" onClick={handleImportClick}>
          <span className="mr-2">Importar</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </Button>
      )}
    </div>
  );
}
