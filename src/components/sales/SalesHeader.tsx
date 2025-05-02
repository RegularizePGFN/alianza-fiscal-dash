
import { Button } from "@/components/ui/button";
import { PlusCircle, FileUp, FileDown } from "lucide-react";
import { UserRole } from "@/lib/types";

interface SalesHeaderProps {
  isAdmin: boolean;
  isManager: boolean;
  onAddSale: () => void;
}

export function SalesHeader({ isAdmin, isManager, onAddSale }: SalesHeaderProps) {
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
        
        {(isAdmin || isManager) && (
          <>
            <Button variant="outline">
              <FileUp className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
