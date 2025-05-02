
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { useUsers } from "@/hooks/useUsers";

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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Salesperson Filter */}
          <div className="space-y-2">
            <Label htmlFor="salesperson">Vendedor</Label>
            <Select 
              value={selectedSalesperson || "all"} 
              onValueChange={handleSalespersonChange}
            >
              <SelectTrigger id="salesperson">
                <SelectValue placeholder="Todos os vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os vendedores</SelectItem>
                {!isLoading && users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
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
            <Label htmlFor="dateRange">Período</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateRange"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
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
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
