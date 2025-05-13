
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { PlusCircle, FileUp, FileDown } from "lucide-react";
import { exportSalesToExcel } from "@/lib/excelUtils";
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

  const handleExport = () => {
    if (sales.length === 0) {
      toast({
        title: "Nenhuma venda para exportar",
        description: "Não há dados de vendas disponíveis para exportar.",
        variant: "destructive"
      });
      return;
    }
    
    const success = exportSalesToExcel(sales);
    if (success) {
      toast({
        title: "Exportação concluída",
        description: "As vendas foram exportadas com sucesso.",
      });
    } else {
      toast({
        title: "Erro na exportação",
        description: "Houve um erro ao exportar as vendas.",
        variant: "destructive"
      });
    }
  };

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
    <div className="flex justify-between items-start">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Vendas</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie as vendas e comissões da equipe.
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAddSale} size="sm" className="h-9">
          <PlusCircle className="mr-2 h-3.5 w-3.5" />
          Nova Venda
        </Button>
        
        {isAdmin && (
          <>
            <Button variant="outline" onClick={handleImportClick} size="sm" className="h-9">
              <FileUp className="mr-2 h-3.5 w-3.5" />
              Importar
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </Button>
            <Button variant="outline" onClick={handleExport} size="sm" className="h-9">
              <FileDown className="mr-2 h-3.5 w-3.5" />
              Exportar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
