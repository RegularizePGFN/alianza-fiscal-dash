
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { Sale } from "@/lib/types";

interface ReportsChartsSectionProps {
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
}

export function ReportsChartsSection({ salesData, loading, error }: ReportsChartsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Análise Gráfica
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Visualizações detalhadas dos dados de vendas
        </p>
      </div>
      <ReportsCharts 
        salesData={salesData} 
        loading={loading}
        error={error}
      />
    </div>
  );
}
