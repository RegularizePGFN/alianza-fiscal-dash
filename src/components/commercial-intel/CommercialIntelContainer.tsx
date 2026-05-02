import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntelFilters, IntelFilterState } from "./IntelFilters";
import { IntelKpiCards } from "./IntelKpiCards";
import { ConversionFunnelTab } from "./tabs/ConversionFunnelTab";
import { ConversionTimeTab } from "./tabs/ConversionTimeTab";
import { PatternsTab } from "./tabs/PatternsTab";
import { SalespersonAnalysisTab } from "./tabs/SalespersonAnalysisTab";
import { OpenProposalsTab } from "./tabs/OpenProposalsTab";
import {
  useIntelSummary,
  useConversionRows,
  useConversionBuckets,
  useHourlyPatterns,
  useSalespersonIntel,
  useOpenProposals,
} from "@/hooks/useCommercialIntel";

export function CommercialIntelContainer() {
  const today = new Date();
  const [filters, setFilters] = useState<IntelFilterState>({
    start: startOfMonth(today),
    end: endOfMonth(today),
    userId: null,
  });

  const summary = useIntelSummary(filters);
  const conversions = useConversionRows(filters);
  const buckets = useConversionBuckets(filters);
  const patterns = useHourlyPatterns(filters);
  const salespeople = useSalespersonIntel({
    start: filters.start,
    end: filters.end,
  });
  const openProps = useOpenProposals(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inteligência Comercial</h1>
        <p className="text-sm text-muted-foreground">
          Análise profunda do funil: cruza propostas e vendas por CNPJ para revelar conversão real, tempo de venda e oportunidades em aberto.
        </p>
      </div>

      <IntelFilters value={filters} onChange={setFilters} />

      <IntelKpiCards data={summary.data} loading={summary.isLoading} />

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="time">Tempo de conversão</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="salespeople">Vendedores</TabsTrigger>
          <TabsTrigger value="open">Em aberto</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <ConversionFunnelTab data={summary.data} loading={summary.isLoading} />
        </TabsContent>
        <TabsContent value="time">
          <ConversionTimeTab
            buckets={buckets.data}
            rows={conversions.data}
            loading={buckets.isLoading || conversions.isLoading}
          />
        </TabsContent>
        <TabsContent value="patterns">
          <PatternsTab data={patterns.data} loading={patterns.isLoading} />
        </TabsContent>
        <TabsContent value="salespeople">
          <SalespersonAnalysisTab data={salespeople.data} loading={salespeople.isLoading} />
        </TabsContent>
        <TabsContent value="open">
          <OpenProposalsTab data={openProps.data} loading={openProps.isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
