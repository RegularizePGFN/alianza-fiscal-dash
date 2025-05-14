
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export function ReportsHeader() {
  return (
    <div className="flex justify-end items-center gap-2 pb-2">
      <TooltipProvider>
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
      </TooltipProvider>

      <TooltipProvider>
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
      </TooltipProvider>
    </div>
  );
}
