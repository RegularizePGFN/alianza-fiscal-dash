
import { PlusCircle, FileUp, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportButton } from "./filters/ImportButton";
import { ExportButton } from "./filters/ExportButton";

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
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={onAddSale}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nova Venda
      </Button>
      
      {isAdmin && onImport && (
        <ImportButton onImport={onImport} />
      )}
      
      {onExport && (
        <Button
          onClick={onExport}
          variant="outline"
          size="sm"
          className="hidden md:flex"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      )}
    </div>
  );
}
