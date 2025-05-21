
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Input } from "@/components/ui/input";
import { DollarSign, Percent, CreditCard, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const handleSelectChange = (name: string, value: string) => {
    const syntheticEvent = {
      target: { name, value }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(syntheticEvent);
  };

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

          {/* Parcelas */}
          <div className="space-y-2">
            <label htmlFor="installments" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Parcelas
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
              <DollarSign className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Valor das Parcelas
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

        {/* Entrada Section - Separated for clarity as requested */}
        <div className="mt-6 p-4 border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 space-y-4">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
            Entrada (referente ao parcelamento da dívida junto à PGFN)
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-300 italic">
            Este valor NÃO corresponde aos honorários da Aliança Fiscal.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData.entryInstallments || '1'}
                onChange={onInputChange}
                disabled={disabled}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 disabled:dark:bg-gray-800 disabled:dark:border-gray-700 disabled:dark:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Valor da Parcela da Entrada
              </label>
              <Input
                value={`R$ ${entryInstallmentValue}`}
                disabled={true}
                className="bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculado automaticamente
              </p>
            </div>
          </div>
        </div>

        {/* Honorários Section */}
        <div className="mt-6 p-4 border border-purple-100 rounded-lg bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800 space-y-4">
          <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400">
            Honorários
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Honorários à Vista */}
            <div className="space-y-2">
              <label htmlFor="feesValue" className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Honorários à Vista
              </label>
              <Input
                id="feesValue"
                name="feesValue"
                placeholder="R$ 0,00"
                value={formData.feesValue || ''}
                onChange={onInputChange}
                disabled={disabled}
                className="bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100 dark:placeholder-purple-300/50 disabled:dark:bg-purple-900/10 disabled:dark:border-purple-800/50 disabled:dark:text-purple-300/50"
              />
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Calculado como 20% da economia obtida
              </p>
            </div>
            
            {/* Honorários Parcelados - Section */}
            <div className="space-y-4 border-l border-purple-200 pl-4 dark:border-purple-700">
              <div>
                <label htmlFor="feesAdditionalPercentage" className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Percentual Adicional
                </label>
                <div className="relative">
                  <Input
                    id="feesAdditionalPercentage"
                    name="feesAdditionalPercentage"
                    type="number"
                    min="0"
                    step="5"
                    placeholder="30"
                    value={formData.feesAdditionalPercentage || '30'}
                    onChange={onInputChange}
                    disabled={disabled}
                    className="bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100 dark:placeholder-purple-300/50 disabled:dark:bg-purple-900/10 disabled:dark:border-purple-800/50 disabled:dark:text-purple-300/50"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 dark:text-purple-400">
                    %
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="feesInstallments" className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Parcelas
                  </label>
                  <Input
                    id="feesInstallments"
                    name="feesInstallments"
                    type="number"
                    min="1"
                    placeholder="6"
                    value={formData.feesInstallments || '6'}
                    onChange={onInputChange}
                    disabled={disabled}
                    className="bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100 dark:placeholder-purple-300/50 disabled:dark:bg-purple-900/10 disabled:dark:border-purple-800/50 disabled:dark:text-purple-300/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="feesPaymentMethod" className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Meio de Pagamento
                  </Label>
                  <Select 
                    name="feesPaymentMethod"
                    value={formData.feesPaymentMethod || 'cartao'} 
                    onValueChange={(value) => handleSelectChange('feesPaymentMethod', value)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Valor da Parcela
                </label>
                <Input
                  value={formData.feesInstallmentValue ? `R$ ${formData.feesInstallmentValue}` : 'R$ 0,00'}
                  disabled={true}
                  className="bg-purple-100 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoSection;
