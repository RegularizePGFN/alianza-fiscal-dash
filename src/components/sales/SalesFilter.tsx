
import { useState, useEffect } from "react";
import { Sale, PaymentMethod, UserRole } from "@/lib/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, FileDown, X } from "lucide-react";
import { exportSalesToExcel } from "@/lib/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SalesFilterProps {
  sales: Sale[];
  onFilter: (filtered: Sale[]) => void;
  onSearch: (searchTerm: string) => void;
}

export function SalesFilter({ sales, onFilter, onSearch }: SalesFilterProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [salespersonFilter, setSalespersonFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);
  
  // Get unique salespersons from sales data
  const salespersons = [...new Set(sales.map(sale => sale.salesperson_name))];
  
  // Get payment methods from enum
  const paymentMethods = Object.values(PaymentMethod);

  // Date range options
  const dateRangeOptions = [
    { value: "7days", label: "Últimos 7 dias" },
    { value: "30days", label: "Últimos 30 dias" },
    { value: "current_month", label: "Mês atual" },
    { value: "last_month", label: "Mês anterior" },
  ];
  
  const applyFilters = () => {
    let filteredSales = [...sales];
    
    // Apply salesperson filter
    if (salespersonFilter) {
      filteredSales = filteredSales.filter(sale => 
        sale.salesperson_name === salespersonFilter
      );
    }
    
    // Apply payment method filter
    if (paymentMethodFilter) {
      filteredSales = filteredSales.filter(sale => 
        sale.payment_method.toString() === paymentMethodFilter
      );
    }
    
    // Apply date filter
    if (dateRangeFilter) {
      const today = new Date();
      let startDate = new Date();
      
      switch (dateRangeFilter) {
        case "7days":
          startDate.setDate(today.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(today.getDate() - 30);
          break;
        case "current_month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case "last_month":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          today.setTime(endDate.getTime());
          break;
      }
      
      filteredSales = filteredSales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= startDate && saleDate <= today;
      });
    }
    
    setIsFilterActive(!!salespersonFilter || !!paymentMethodFilter || !!dateRangeFilter);
    onFilter(filteredSales);
  };
  
  const resetFilters = () => {
    setSalespersonFilter("");
    setPaymentMethodFilter("");
    setDateRangeFilter("");
    setIsFilterActive(false);
    onFilter(sales);
  };
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      
      const filteredSales = sales.filter(sale => 
        sale.client_name.toLowerCase().includes(searchLower) ||
        sale.client_document?.toLowerCase().includes(searchLower) ||
        sale.salesperson_name?.toLowerCase().includes(searchLower)
      );
      
      onSearch(searchTerm);
      onFilter(filteredSales);
    } else if (searchTerm === "") {
      // If search term is cleared, reset to current filters
      applyFilters();
      onSearch("");
    }
  }, [searchTerm]);
  
  // Export current filtered data to Excel
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
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Advanced Filter Popover */}
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
                <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Fixed: Use a non-empty value for the "All" option */}
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
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Fixed: Use a non-empty value for the "All" option */}
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
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Fixed: Use a non-empty value for the "All" option */}
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
                  onClick={() => {
                    // Handle "all" values specially when applying filters
                    if (salespersonFilter === "all_salespersons") setSalespersonFilter("");
                    if (paymentMethodFilter === "all_payment_methods") setPaymentMethodFilter("");
                    if (dateRangeFilter === "all_dates") setDateRangeFilter("");
                    applyFilters();
                  }} 
                  className="flex-1"
                >
                  Aplicar
                </Button>
                <Button 
                  onClick={resetFilters} 
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
        
        {/* Export Button */}
        <Button
          onClick={handleExport}
          variant="outline"
          size="icon"
          className="hidden md:flex"
          aria-label="Exportar"
        >
          <FileDown className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Filter Indicators - shows active filters */}
      {isFilterActive && (
        <div className="flex flex-wrap gap-2 text-xs">
          {salespersonFilter && salespersonFilter !== "all_salespersons" && (
            <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-1">
              <span>Vendedor: {salespersonFilter}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setSalespersonFilter("");
                  applyFilters();
                }}
              />
            </div>
          )}
          {paymentMethodFilter && paymentMethodFilter !== "all_payment_methods" && (
            <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-1">
              <span>Pagamento: {paymentMethodFilter}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setPaymentMethodFilter("");
                  applyFilters();
                }}
              />
            </div>
          )}
          {dateRangeFilter && dateRangeFilter !== "all_dates" && (
            <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-1">
              <span>Período: {dateRangeOptions.find(opt => opt.value === dateRangeFilter)?.label}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setDateRangeFilter("");
                  applyFilters();
                }}
              />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs px-2"
            onClick={resetFilters}
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
}
