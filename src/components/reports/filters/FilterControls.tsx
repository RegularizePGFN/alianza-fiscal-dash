
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterControlsProps {
  users: any[];
  isLoading: boolean;
  date: DateRange | undefined;
  selectedSalesperson: string | null;
  selectedPaymentMethod: PaymentMethod | null;
  onDateSelect: (range: DateRange | undefined) => void;
  onSalespersonChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
}

export function FilterControls({
  users,
  isLoading,
  date,
  selectedSalesperson,
  selectedPaymentMethod,
  onDateSelect,
  onSalespersonChange,
  onPaymentMethodChange
}: FilterControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Salesperson Filter */}
      <div className="space-y-2">
        <Label htmlFor="salesperson" className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Vendedor
        </Label>
        <Select 
          value={selectedSalesperson || "all"} 
          onValueChange={onSalespersonChange}
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
          onValueChange={onPaymentMethodChange}
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
              onSelect={onDateSelect}
              numberOfMonths={2}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
