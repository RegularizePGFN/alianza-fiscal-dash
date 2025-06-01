
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesReportsTab } from "./tabs/SalesReportsTab";
import { ProposalsReportsTab } from "./tabs/ProposalsReportsTab";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { Sale } from "@/lib/types";

interface ReportsSubTabsProps {
  selectedSalesperson: string | null;
  selectedPaymentMethod: PaymentMethod | null;
  dateFilter: DateFilter | null;
  consolidatedMonth: number;
  consolidatedYear: number;
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
  onSalespersonChange: (value: string | null) => void;
  onPaymentMethodChange: (value: PaymentMethod | null) => void;
  onDateFilterChange: (value: DateFilter | null) => void;
  onConsolidatedMonthChange: (month: number) => void;
  onConsolidatedYearChange: (year: number) => void;
}

export function ReportsSubTabs({
  selectedSalesperson,
  selectedPaymentMethod,
  dateFilter,
  consolidatedMonth,
  consolidatedYear,
  salesData,
  loading,
  error,
  onSalespersonChange,
  onPaymentMethodChange,
  onDateFilterChange,
  onConsolidatedMonthChange,
  onConsolidatedYearChange,
}: ReportsSubTabsProps) {
  return (
    <Tabs defaultValue="vendas" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="vendas">Relatórios de Vendas</TabsTrigger>
        <TabsTrigger value="propostas">Relatórios de Propostas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="vendas">
        <SalesReportsTab
          selectedSalesperson={selectedSalesperson}
          selectedPaymentMethod={selectedPaymentMethod}
          dateFilter={dateFilter}
          consolidatedMonth={consolidatedMonth}
          consolidatedYear={consolidatedYear}
          salesData={salesData}
          loading={loading}
          error={error}
          onSalespersonChange={onSalespersonChange}
          onPaymentMethodChange={onPaymentMethodChange}
          onDateFilterChange={onDateFilterChange}
          onConsolidatedMonthChange={onConsolidatedMonthChange}
          onConsolidatedYearChange={onConsolidatedYearChange}
        />
      </TabsContent>
      
      <TabsContent value="propostas">
        <ProposalsReportsTab />
      </TabsContent>
    </Tabs>
  );
}
