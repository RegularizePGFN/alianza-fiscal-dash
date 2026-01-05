
import { useState } from "react";
import { FileDown, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportSalesToExcel, exportAllSalesToExcel } from "@/lib/excelUtils";
import { Sale } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  onExport?: () => void;
  sales?: Sale[];
}

export function ExportButton({ onExport, sales = [] }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportCurrent = () => {
    if (onExport) {
      onExport();
    } else if (sales && sales.length > 0) {
      exportSalesToExcel(sales);
      toast({
        title: "Exportação concluída",
        description: `${sales.length} vendas exportadas.`,
      });
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const count = await exportAllSalesToExcel((loaded) => {
        console.log(`Carregando... ${loaded} registros`);
      });
      toast({
        title: "Exportação completa",
        description: `${count} vendas exportadas do histórico completo.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar as vendas.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hidden md:flex"
          aria-label="Exportar"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCurrent} disabled={sales.length === 0}>
          <FileDown className="h-4 w-4 mr-2" />
          Exportar visualização atual ({sales.length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportAll} disabled={isExporting}>
          <Database className="h-4 w-4 mr-2" />
          Exportar histórico completo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
