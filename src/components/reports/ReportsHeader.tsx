
import React from "react";
import { Button } from "@/components/ui/button";
import { ChartPie, Download, Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export function ReportsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ChartPie className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        </div>
        <p className="text-muted-foreground">
          Análise consolidada de vendas e visualizações gráficas dos dados.
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Exportar relatórios</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <Info className="h-4 w-4" />
              <span className="sr-only">Informações</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Estes relatórios são atualizados em tempo real.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
