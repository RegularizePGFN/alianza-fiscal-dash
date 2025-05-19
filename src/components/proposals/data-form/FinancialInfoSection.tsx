
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Input } from "@/components/ui/input";
import { DollarSign, Percent, CreditCard } from 'lucide-react';

interface FinancialInfoSectionProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  entryInstallmentValue: string;
}

const FinancialInfoSection = ({
  formData,
  onInputChange,
  disabled,
  entryInstallmentValue
}: FinancialInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-slate-700 dark:text-slate-200">
        Dados Financeiros
      </h2>
      
      <div className="p-5 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Valor Total do Débito */}
          <div className="space-y-2">
            <label htmlFor="totalDebt" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Valor Total da Dívida
            </label>
            <Input
              id="totalDebt"
              name="totalDebt"
              placeholder="R$ 0,00"
              value={formData.totalDebt || ''}
              onChange={onInputChange}
              disabled={disabled}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:dark:text-gray-400"
            />
          </div>

          {/* Valor com Reduções */}
          <div className="space-y-2">
            <label htmlFor="discountedValue" className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              Valor com Reduções
            </label>
            <Input
              id="discountedValue"
              name="discountedValue"
              placeholder="R$ 0,00"
              value={formData.discountedValue || ''}
              onChange={onInputChange}
              disabled={disabled}
              className="bg-green-50 dark:bg-green-900/30 dark:border-green-800 dark:text-green-100 dark:placeholder-green-300/50 disabled:dark:bg-green-900/20 disabled:dark:border-green-800/50 disabled:dark:text-green-300/50"
            />
          </div>

          {/* Percentual de Desconto */}
          <div className="space-y-2">
            <label htmlFor="discountPercentage" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Percent className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Percentual de Desconto
            </label>
            <Input
              id="discountPercentage"
              name="discountPercentage"
              placeholder="0%"
              value={formData.discountPercentage || ''}
              onChange={onInputChange}
              disabled={disabled}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:dark:text-gray-400"
            />
          </div>

          {/* Entrada */}
          <div className="space-y-2">
            <label htmlFor="entryValue" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Valor da Entrada
            </label>
            <Input
              id="entryValue"
              name="entryValue"
              placeholder="R$ 0,00"
              value={formData.entryValue || ''}
              onChange={onInputChange}
              disabled={disabled}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:dark:text-gray-400"
            />
          </div>

          {/* Número de Parcelas da Entrada */}
          <div className="space-y-2">
            <label htmlFor="entryInstallments" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Parcelas da Entrada
            </label>
            <Input
              id="entryInstallments"
              name="entryInstallments"
              type="number"
              min="1"
              placeholder="1"
              value={formData.entryInstallments || ''}
              onChange={onInputChange}
              disabled={disabled}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:dark:text-gray-400"
            />
          </div>

          {/* Valor da Parcela de Entrada */}
          <div className="space-y-2">
            <label htmlFor="entryInstallmentValue" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Valor de cada parcela da entrada
            </label>
            <Input
              id="entryInstallmentValue"
              value={`R$ ${entryInstallmentValue}`}
              disabled={true}
              className="bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
            />
          </div>

          {/* Número de Parcelas */}
          <div className="space-y-2">
            <label htmlFor="installments" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Número de Parcelas Restantes
            </label>
            <Input
              id="installments"
              name="installments"
              type="number"
              min="1"
              placeholder="1"
              value={formData.installments || ''}
              onChange={onInputChange}
              disabled={disabled}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:dark:text-gray-400"
            />
          </div>

          {/* Valor das Parcelas */}
          <div className="space-y-2">
            <label htmlFor="installmentValue" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Valor das Parcelas Restantes
            </label>
            <Input
              id="installmentValue"
              name="installmentValue"
              placeholder="R$ 0,00"
              value={formData.installmentValue || ''}
              onChange={onInputChange}
              disabled={disabled}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:dark:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoSection;
