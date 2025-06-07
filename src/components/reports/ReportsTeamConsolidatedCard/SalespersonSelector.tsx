
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Users, Check } from "lucide-react";

interface SalespersonSelectorProps {
  allAvailableSalespeople: { id: string; name: string }[];
  appliedSelectedSalespeople: string[];
  onApplySelection: (selectedIds: string[]) => void;
  onClearSelection: () => void;
}

export function SalespersonSelector({
  allAvailableSalespeople,
  appliedSelectedSalespeople,
  onApplySelection,
  onClearSelection
}: SalespersonSelectorProps) {
  const [tempSelectedSalespeople, setTempSelectedSalespeople] = useState<string[]>(appliedSelectedSalespeople);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleTempSalespersonSelection = (salespersonId: string) => {
    setTempSelectedSalespeople(prev => {
      if (prev.includes(salespersonId)) {
        return prev.filter(id => id !== salespersonId);
      } else {
        return [...prev, salespersonId];
      }
    });
  };

  const applySelection = () => {
    onApplySelection(tempSelectedSalespeople);
    setIsPopoverOpen(false);
  };

  const clearSelection = () => {
    setTempSelectedSalespeople([]);
    onClearSelection();
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4" />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48">
            Selecionar vendedores
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Selecionar vendedores para comparativo</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allAvailableSalespeople.map((person) => (
                <div key={person.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={person.id}
                    checked={tempSelectedSalespeople.includes(person.id)}
                    onCheckedChange={() => handleTempSalespersonSelection(person.id)}
                  />
                  <label htmlFor={person.id} className="text-sm cursor-pointer">
                    {person.name}
                  </label>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Limpar
              </Button>
              <Button size="sm" onClick={applySelection}>
                <Check className="h-4 w-4 mr-1" />
                Aplicar ({tempSelectedSalespeople.length})
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
