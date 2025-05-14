
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportSalesToExcel } from "@/lib/excelUtils";
import { Sale } from "@/lib/types";

interface ExportButtonProps {
  onExport?: () => void;
  sales?: Sale[];
}

export function ExportButton({ onExport, sales = [] }: ExportButtonProps) {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else if (sales && sales.length > 0) {
      // Export the provided sales directly
      exportSalesToExcel(sales);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="icon"
      className="hidden md:flex"
      aria-label="Exportar"
    >
      <FileDown className="h-4 w-4" />
    </Button>
  );
}
