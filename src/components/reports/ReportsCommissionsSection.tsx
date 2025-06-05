
import { useState } from "react";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ReportsCommissionsSection() {
  // State for commission month filter
  const [selectedCommissionMonth, setSelectedCommissionMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Generate month options for commission filter
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 12; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Consolidado Vendedores
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Resumo detalhado do desempenho dos vendedores por mês
            </p>
          </div>
        </div>
        
        <SalespeopleCommissionsCard selectedMonth={selectedCommissionMonth} />
      </div>
    </div>
  );
}
