
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { useUsers } from "@/hooks/useUsers";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompactReportsFilterProps {
  onSalespersonChange: (salespersonId: string | null) => void;
  onPaymentMethodChange: (method: PaymentMethod | null) => void;
  onDateFilterChange: (dateFilter: DateFilter | null) => void;
  currentMonth: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  hasCustomFilter: boolean;
}

export function CompactReportsFilter({
  onSalespersonChange,
  onPaymentMethodChange,
  onDateFilterChange,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  hasCustomFilter
}: CompactReportsFilterProps) {
  const { users, isLoading } = useUsers();
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

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
                          hasCustomFilter;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-300">
      <div className="flex flex-wrap items-center gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Mês:
          </Label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[120px] text-center">
              <span className="text-sm font-medium capitalize">{currentMonth}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Salesperson Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Vendedor:
          </Label>
          <Select 
            value={selectedSalesperson || "all"} 
            onValueChange={handleSalespersonChange}
          >
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                <SelectItem value="all">Todos</SelectItem>
                {!isLoading && users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Pagamento:
          </Label>
          <Select 
            value={selectedPaymentMethod || "all"} 
            onValueChange={handlePaymentMethodChange}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={PaymentMethod.CREDIT}>Crédito</SelectItem>
              <SelectItem value={PaymentMethod.DEBIT}>Débito</SelectItem>
              <SelectItem value={PaymentMethod.PIX}>Pix</SelectItem>
              <SelectItem value={PaymentMethod.BOLETO}>Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Período:
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-52 h-8 justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  hasCustomFilter && "border-primary/50"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {hasCustomFilter && date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM")} - {format(date.to, "dd/MM")}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Período personalizado</span>
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

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
          >
            <FilterX className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
