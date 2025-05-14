
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterPopoverProps {
  isFilterActive: boolean;
  salespersonFilter: string;
  paymentMethodFilter: string;
  dateRangeFilter: string;
  salespersons: string[];
  paymentMethods: PaymentMethod[];
  dateRangeOptions: { value: string; label: string }[];
  onUpdateSalespersonFilter: (value: string) => void;
  onUpdatePaymentMethodFilter: (value: string) => void;
  onUpdateDateRangeFilter: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function FilterPopover({
  isFilterActive,
  salespersonFilter,
  paymentMethodFilter,
  dateRangeFilter,
  salespersons,
  paymentMethods,
  dateRangeOptions,
  onUpdateSalespersonFilter,
  onUpdatePaymentMethodFilter,
  onUpdateDateRangeFilter,
  onApplyFilters,
  onResetFilters
}: FilterPopoverProps) {
  // Local state for filter values before applying them
  const [localSalespersonFilter, setLocalSalespersonFilter] = useState(salespersonFilter);
  const [localPaymentMethodFilter, setLocalPaymentMethodFilter] = useState(paymentMethodFilter);
  const [localDateRangeFilter, setLocalDateRangeFilter] = useState(dateRangeFilter);

  const handleApplyFilters = () => {
    // Update parent state with local values
    onUpdateSalespersonFilter(localSalespersonFilter);
    onUpdatePaymentMethodFilter(localPaymentMethodFilter);
    onUpdateDateRangeFilter(localDateRangeFilter);
    
    // Apply the filters
    onApplyFilters();
  };
  
  // Reset local state when main state changes
  useState(() => {
    setLocalSalespersonFilter(salespersonFilter);
    setLocalPaymentMethodFilter(paymentMethodFilter);
    setLocalDateRangeFilter(dateRangeFilter);
  });
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={isFilterActive ? "default" : "outline"} 
          size="icon" 
          className="relative"
          aria-label="Filtros Avançados"
        >
          <Filter className="h-4 w-4" />
          {isFilterActive && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium leading-none mb-3">Filtros Avançados</h4>
          
          <div className="space-y-2">
            <p className="text-sm">Vendedor</p>
            <Select 
              value={localSalespersonFilter} 
              onValueChange={setLocalSalespersonFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_salespersons">Todos</SelectItem>
                {salespersons.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm">Método de pagamento</p>
            <Select 
              value={localPaymentMethodFilter} 
              onValueChange={setLocalPaymentMethodFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_payment_methods">Todos</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm">Período</p>
            <Select 
              value={localDateRangeFilter} 
              onValueChange={setLocalDateRangeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_dates">Todos</SelectItem>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Aplicar
            </Button>
            <Button 
              onClick={onResetFilters}
              variant="outline"
              className="flex items-center"
            >
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
