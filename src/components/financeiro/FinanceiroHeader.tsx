
import { Building } from "lucide-react";

export function FinanceiroHeader() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
          <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Financeiro
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie custos e monitore o lucro líquido da empresa
          </p>
        </div>
      </div>
    </div>
  );
}
