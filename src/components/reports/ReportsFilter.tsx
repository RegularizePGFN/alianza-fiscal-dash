
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FilterX, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { useUsers } from "@/hooks/useUsers";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportsFilterProps {
  onSalespersonChange: (salespersonId: string | null) => void;
  onPaymentMethodChange: (method: PaymentMethod | null) => void;
  onDateFilterChange: (dateFilter: DateFilter | null) => void;
}

export function ReportsFilter({
  onSalespersonChange,
  onPaymentMethodChange,
  onDateFilterChange
}: ReportsFilterProps) {
  const { users, isLoading } = useUsers();
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Handle date selection
  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    
    if (range?.from && range?.to) {
      onDateFilterChange({
        startDate: range.from,
        endDate: range.to
      });
    } else {
      onDateFilterChange(null);
    }
  };

  // Handle salesperson selection
  const handleSalespersonChange = (value: string) => {
    const newValue = value === "all" ? null : value;
    setSelectedSalesperson(newValue);
    onSalespersonChange(newValue);
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (value: string) => {
    const newValue = value === "all" ? null : value as PaymentMethod;
    setSelectedPaymentMethod(newValue);
    onPaymentMethodChange(newValue);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSalesperson(null);
    setSelectedPaymentMethod(null);
    onSalespersonChange(null);
    onPaymentMethodChange(null);
    onDateFilterChange(null);
    setDate(undefined);
  };

  const hasActiveFilters = selectedSalesperson !== null || 
                          selectedPaymentMethod !== null || 
                          (date?.from !== undefined && date?.to !== undefined);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-t-lg">
        <CardTitle className="text-lg">Filtros</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </Button>
      </CardHeader>

      {showFilters && (
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Salesperson Filter */}
            <div className="space-y-2">
              <Label htmlFor="salesperson" className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Vendedor
              </Label>
              <Select 
                value={selectedSalesperson || "all"} 
                onValueChange={handleSalespersonChange}
              >
                <SelectTrigger id="salesperson">
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    <SelectItem value="all">Todos os vendedores</SelectItem>
                    {!isLoading && users.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Método de Pagamento
              </Label>
              <Select 
                value={selectedPaymentMethod || "all"} 
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Todos os métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os métodos</SelectItem>
                  <SelectItem value={PaymentMethod.CREDIT}>Crédito</SelectItem>
                  <SelectItem value={PaymentMethod.DEBIT}>Débito</SelectItem>
                  <SelectItem value={PaymentMethod.PIX}>Pix</SelectItem>
                  <SelectItem value={PaymentMethod.BOLETO}>Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label htmlFor="dateRange" className="flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5" />
                Período
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dateRange"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      date && "border-primary/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd/MM/yyyy")} -{" "}
                          {format(date.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(date.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Selecione um período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className={cn(
                "gap-2",
                hasActiveFilters 
                  ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-600 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800 dark:text-red-400"
                  : ""
              )}
              disabled={!hasActiveFilters}
            >
              <FilterX className="h-4 w-4" />
              Limpar Filtros
              {hasActiveFilters && <span className="ml-1 w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full grid place-items-center text-xs">
                {(selectedSalesperson ? 1 : 0) + (selectedPaymentMethod ? 1 : 0) + (date?.from && date?.to ? 1 : 0)}
              </span>}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
