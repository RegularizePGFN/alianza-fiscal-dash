
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sale } from "@/lib/types";
import { Search, FileText, PlusCircle } from "lucide-react";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface SalesFilterProps {
  sales: Sale[];
  onFilter: (filteredSales: Sale[]) => void;
  onSearch: (searchTerm: string) => void;
  onAddSale?: () => void;
  onImport?: (file: File) => void;
  isAdmin?: boolean;
  hideButtons?: boolean;
}

export function SalesFilter({ 
  sales, 
  onFilter, 
  onSearch,
  onAddSale,
  onImport,
  isAdmin = false,
  hideButtons = false
}: SalesFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  
  const uniquePaymentMethods = Array.from(
    new Set(sales.map((sale) => sale.payment_method))
  ).filter(Boolean).sort();
  
  const applyFilters = useCallback(() => {
    let filtered = [...sales];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.client_document.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.salesperson_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatCurrency(parseFloat(sale.gross_amount.toString())).includes(searchTerm)
      );
    }
    
    // Filter by date
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(sale => 
        sale.sale_date === selectedDateStr
      );
    }
    
    // Filter by payment method
    if (paymentMethod) {
      filtered = filtered.filter(sale => 
        sale.payment_method === paymentMethod
      );
    }
    
    onFilter(filtered);
  }, [sales, searchTerm, selectedDate, paymentMethod, onFilter]);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);
  
  // Update the parent search term
  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);
  
  const handleReset = () => {
    setSearchTerm("");
    setSelectedDate(undefined);
    setPaymentMethod(undefined);
    onFilter(sales);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2 justify-between w-full">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={selectedDate ? "border-primary" : ""}>
                {selectedDate ? (
                  <span>{selectedDate.toLocaleDateString()}</span>
                ) : (
                  <span>Data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              {uniquePaymentMethods.map(method => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Limpar
          </Button>
        </div>
      </div>
      
      {!hideButtons && (
        <div className="flex gap-2">
          {onAddSale && (
            <Button onClick={onAddSale} className="w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          )}
          
          {isAdmin && onImport && (
            <Button 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.xls';
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files[0]) {
                    onImport(target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Importar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
