
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <p className="text-muted-foreground">
          Gerencie as vendas e comissões da equipe.
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onAddSale}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
        
        {isAdmin && (
          <>
            <Button variant="outline" onClick={handleImportClick}>
              <FileUp className="mr-2 h-4 w-4" />
              Importar
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
