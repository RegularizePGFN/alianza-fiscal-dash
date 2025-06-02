
import { DollarSign, TrendingUp } from "lucide-react";

export function FinanceiroHeader() {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
        <DollarSign className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-600">Gerencie custos e monitore o lucro líquido da empresa</p>
      </div>
    </div>
  );
}
