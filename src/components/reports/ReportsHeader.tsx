
import React from "react";
import { Button } from "@/components/ui/button";
import { ChartPie, Download, Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export function ReportsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <ChartPie className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Análise consolidada de vendas e visualizações gráficas dos dados.
        </p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => window.print()}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Exportar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Exportar relatórios</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Info className="h-3.5 w-3.5" />
                <span className="sr-only">Informações</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Estes relatórios são atualizados em tempo real.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
