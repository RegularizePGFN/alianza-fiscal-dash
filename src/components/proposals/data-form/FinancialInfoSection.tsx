
import React from 'react';
import { FileBarChart, CreditCard, BanknoteIcon, Calculator, Percent, CalendarRange } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ExtractedData } from '@/lib/types/proposals';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface FinancialInfoSectionProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  entryInstallmentValue: string;
}

const FinancialInfoSection = ({ 
  formData, 
  onInputChange, 
  disabled = false,
  entryInstallmentValue
}: FinancialInfoSectionProps) => {
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    const syntheticEvent = {
      target: {
        name,
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(syntheticEvent);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    const syntheticEvent = {
      target: {
        name,
        value: checked ? 'true' : 'false'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(syntheticEvent);
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-gray-800 flex items-center dark:text-gray-200">
        <FileBarChart className="mr-2 h-5 w-5 text-af-blue-600 dark:text-af-blue-400" />
        Dados Financeiros
      </h3>
      
      {/* Valores da Negociação */}
      <div className="space-y-4">
        <div className="flex items-center">
          <BanknoteIcon className="h-4 w-4 text-af-blue-600 mr-2" />
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Valores da Negociação</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor Total da Dívida
            </label>
            <Input
              name="totalDebt"
              value={formData.totalDebt || ""}
              onChange={onInputChange}
              placeholder="0,00"
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor com Desconto
            </label>
            <Input
              name="discountedValue"
              value={formData.discountedValue || ""}
              onChange={onInputChange}
              placeholder="0,00"
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Percentual de Desconto
            </label>
            <Input
              name="discountPercentage"
              value={formData.discountPercentage || ""}
              onChange={onInputChange}
              placeholder="0"
              disabled={disabled}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Parcelamento */}
      <div className="space-y-4">
        <div className="flex items-center">
          <CalendarRange className="h-4 w-4 text-af-blue-600 mr-2" />
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Parcelamento</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor da Entrada (por parcela)
            </label>
            <Input
              name="entryValue"
              value={formData.entryValue || ""}
              onChange={onInputChange}
              placeholder="0,00"
              disabled={disabled}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Valor de cada parcela da entrada</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Parcelas da Entrada
            </label>
            <Input
              name="entryInstallments"
              value={formData.entryInstallments || "1"}
              onChange={onInputChange}
              placeholder="1"
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total da Entrada
            </label>
            <Input
              value={
                formData.entryValue && formData.entryInstallments
                  ? `R$ ${(
                      parseFloat(formData.entryValue.replace(/\./g, '').replace(',', '.')) *
                      parseInt(formData.entryInstallments)
                    ).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`
                  : "R$ 0,00"
              }
              disabled={true}
              className="mt-1 bg-gray-50"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor da Parcela
            </label>
            <Input
              name="installmentValue"
              value={formData.installmentValue || ""}
              onChange={onInputChange}
              placeholder="0,00"
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Número de Parcelas
            </label>
            <Input
              name="installments"
              value={formData.installments || ""}
              onChange={onInputChange}
              placeholder="0"
              disabled={disabled}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Honorários */}
      <div className="space-y-4">
        <div className="flex items-center">
          <Calculator className="h-4 w-4 text-af-blue-600 mr-2" />
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Honorários</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor dos Honorários (à vista)
            </label>
            <Input
              name="feesValue"
              value={formData.feesValue || ""}
              onChange={onInputChange}
              placeholder="0,00"
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div className="flex items-end gap-2 pb-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showFeesInstallments" 
                checked={formData.showFeesInstallments === 'true'}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('showFeesInstallments', checked === true)
                }
              />
              <label 
                htmlFor="showFeesInstallments" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mostrar honorários parcelados na proposta
              </label>
            </div>
          </div>
        </div>
        
        {formData.showFeesInstallments === 'true' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-3 bg-gray-50 border rounded-md">
            <div>
              <label className="text-sm font-medium text-gray-700">
                % adicional para parcelamento
              </label>
              <Input
                name="feesAdditionalPercentage"
                value={formData.feesAdditionalPercentage || "30"}
                onChange={onInputChange}
                placeholder="30"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Parcelas
              </label>
              <Input
                name="feesInstallments"
                value={formData.feesInstallments || "6"}
                onChange={onInputChange}
                placeholder="6"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Forma de Pagamento
              </label>
              <Select
                value={formData.feesPaymentMethod || "cartao"}
                onValueChange={(value) => handleSelectChange('feesPaymentMethod', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartao">Cartão de crédito</SelectItem>
                  <SelectItem value="boleto">Boleto bancário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Valor da parcela
              </label>
              <Input
                name="feesInstallmentValue"
                value={formData.feesInstallmentValue || ""}
                onChange={onInputChange}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">
                Valor total parcelado
              </label>
              <Input
                name="feesTotalInstallmentValue"
                value={formData.feesTotalInstallmentValue || ""}
                onChange={onInputChange}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Número do Processo */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Número da Dívida/Processo
        </label>
        <Input
          name="debtNumber"
          value={formData.debtNumber || ""}
          onChange={onInputChange}
          placeholder="Insira o número do processo"
          disabled={disabled}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default FinancialInfoSection;
