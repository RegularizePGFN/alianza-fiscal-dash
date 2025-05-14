
import { useState, useEffect } from "react";
import { Sale, PaymentMethod, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { exportSalesToExcel } from "@/lib/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

// Import our new components
import { 
  SearchInput, 
  FilterPopover, 
  FilterIndicator, 
  ExportButton 
} from "./filters";

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
    if (salespersonFilter && salespersonFilter !== "all_salespersons") {
      filteredSales = filteredSales.filter(sale => 
        sale.salesperson_name === salespersonFilter
      );
    }
    
    // Apply payment method filter
    if (paymentMethodFilter && paymentMethodFilter !== "all_payment_methods") {
      filteredSales = filteredSales.filter(sale => 
        sale.payment_method.toString() === paymentMethodFilter
      );
    }
    
    // Apply date filter
    if (dateRangeFilter && dateRangeFilter !== "all_dates") {
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
  
  // Handler for clearing individual filters
  const handleClearFilter = (filterType: 'salesperson' | 'paymentMethod' | 'dateRange') => {
    switch (filterType) {
      case 'salesperson':
        setSalespersonFilter("");
        break;
      case 'paymentMethod':
        setPaymentMethodFilter("");
        break;
      case 'dateRange':
        setDateRangeFilter("");
        break;
    }
    
    // Apply filters after clearing
    setTimeout(applyFilters, 0);
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
    if (success === true) {
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
        <SearchInput 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />
        
        {/* Advanced Filter Popover */}
        <FilterPopover
          isFilterActive={isFilterActive}
          salespersonFilter={salespersonFilter}
          paymentMethodFilter={paymentMethodFilter}
          dateRangeFilter={dateRangeFilter}
          salespersons={salespersons}
          paymentMethods={paymentMethods}
          dateRangeOptions={dateRangeOptions}
          onUpdateSalespersonFilter={setSalespersonFilter}
          onUpdatePaymentMethodFilter={setPaymentMethodFilter}
          onUpdateDateRangeFilter={setDateRangeFilter}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
        />
        
        {/* Export Button */}
        <ExportButton onExport={handleExport} />
      </div>
      
      {/* Filter Indicators */}
      <FilterIndicator 
        filters={{
          salespersonFilter,
          paymentMethodFilter,
          dateRangeFilter
        }}
        dateRangeOptions={dateRangeOptions}
        onClearFilter={handleClearFilter}
        onClearAll={resetFilters}
      />
    </div>
  );
}
