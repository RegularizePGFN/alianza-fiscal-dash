
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterIndicatorProps {
  filters: {
    salespersonFilter: string;
    paymentMethodFilter: string;
    dateRangeFilter: string;
  };
  dateRangeOptions: { value: string; label: string }[];
  onClearFilter: (filterType: 'salesperson' | 'paymentMethod' | 'dateRange') => void;
  onClearAll: () => void;
}

export function FilterIndicator({ 
  filters, 
  dateRangeOptions, 
  onClearFilter, 
  onClearAll 
}: FilterIndicatorProps) {
  const { salespersonFilter, paymentMethodFilter, dateRangeFilter } = filters;
  
  const isFilterActive = !!salespersonFilter || !!paymentMethodFilter || !!dateRangeFilter;
  
  if (!isFilterActive) return null;
  
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {salespersonFilter && salespersonFilter !== "all_salespersons" && (
        <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-1">
          <span>Vendedor: {salespersonFilter}</span>
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onClearFilter('salesperson')}
          />
        </div>
      )}
      
      {paymentMethodFilter && paymentMethodFilter !== "all_payment_methods" && (
        <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-1">
          <span>Pagamento: {paymentMethodFilter}</span>
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onClearFilter('paymentMethod')}
          />
        </div>
      )}
      
      {dateRangeFilter && dateRangeFilter !== "all_dates" && (
        <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-1">
          <span>Período: {dateRangeOptions.find(opt => opt.value === dateRangeFilter)?.label}</span>
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onClearFilter('dateRange')}
          />
        </div>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 text-xs px-2"
        onClick={onClearAll}
      >
        Limpar todos
      </Button>
    </div>
  );
}
