
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
import { Search, Filter, FileDown } from "lucide-react";
import { exportSalesToExcel } from "@/lib/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

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
    
    onFilter(filteredSales);
  };
  
  const resetFilters = () => {
    setSalespersonFilter("");
    setPaymentMethodFilter("");
    setDateRangeFilter("");
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
    // Get the current filtered data from parent component
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
    <div className="bg-background border rounded-md p-4 mb-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar vendas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button
            onClick={handleExport}
            variant="outline"
            className="whitespace-nowrap flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm font-medium mb-1.5">Vendedor</p>
          <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {salespersons.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1.5">Método de pagamento</p>
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1.5">Período</p>
          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end gap-2">
          <Button 
            onClick={applyFilters} 
            variant="default" 
            className="flex-1 flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button 
            onClick={resetFilters} 
            variant="outline"
            className="flex-1"
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}
