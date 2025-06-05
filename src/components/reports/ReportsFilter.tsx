
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { useUsers } from "@/hooks/useUsers";
import { FilterHeader } from "@/components/reports/filters/FilterHeader";
import { FilterControls } from "@/components/reports/filters/FilterControls";
import { FilterActions } from "@/components/reports/filters/FilterActions";

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
    console.log("Date range selected:", range);
    setDate(range);
    
    if (range?.from && range?.to) {
      console.log("Setting date filter with range:", range.from, range.to);
      onDateFilterChange({
        startDate: range.from,
        endDate: range.to
      });
    } else {
      console.log("Clearing date filter");
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
    console.log("Clearing all filters");
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

  const activeFilterCount = (selectedSalesperson ? 1 : 0) + 
                           (selectedPaymentMethod ? 1 : 0) + 
                           (date?.from && date?.to ? 1 : 0);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <FilterHeader 
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <CardContent className="pt-4">
          <FilterControls
            users={users}
            isLoading={isLoading}
            date={date}
            selectedSalesperson={selectedSalesperson}
            selectedPaymentMethod={selectedPaymentMethod}
            onDateSelect={handleDateSelect}
            onSalespersonChange={handleSalespersonChange}
            onPaymentMethodChange={handlePaymentMethodChange}
          />
          
          <FilterActions
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
          />
        </CardContent>
      )}
    </Card>
  );
}
