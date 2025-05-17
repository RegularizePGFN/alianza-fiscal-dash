
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ExtractedData } from '@/lib/types/proposals';

interface FinancialInfoSectionProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FinancialInfoSection = ({ formData, onInputChange }: FinancialInfoSectionProps) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="totalDebt">Valor Consolidado (R$)</Label>
        <Input 
          id="totalDebt" 
          name="totalDebt"
          value={formData.totalDebt || ''}
          onChange={onInputChange}
          placeholder="0,00"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="discountedValue">Valor com Reduções (R$)</Label>
        <Input 
          id="discountedValue" 
          name="discountedValue"
          value={formData.discountedValue || ''}
          onChange={onInputChange}
          placeholder="0,00"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="discountPercentage">Percentual de Desconto (%)</Label>
        <Input 
          id="discountPercentage" 
          name="discountPercentage"
          value={formData.discountPercentage || ''}
          onChange={onInputChange}
          placeholder="0,00"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="entryValue">Valor da Entrada (R$)</Label>
        <Input 
          id="entryValue" 
          name="entryValue"
          value={formData.entryValue || ''}
          onChange={onInputChange}
          placeholder="0,00"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="entryInstallments">Parcelas da Entrada</Label>
        <Input 
          id="entryInstallments" 
          name="entryInstallments"
          value={formData.entryInstallments || '1'}
          onChange={onInputChange}
          placeholder="1"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="installments">Número de Parcelas</Label>
        <Input 
          id="installments" 
          name="installments"
          value={formData.installments || ''}
          onChange={onInputChange}
          placeholder="0"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="installmentValue">Valor da Parcela (R$)</Label>
        <Input 
          id="installmentValue" 
          name="installmentValue"
          value={formData.installmentValue || ''}
          onChange={onInputChange}
          placeholder="0,00"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="feesValue">Honorários (R$)</Label>
        <Input 
          id="feesValue" 
          name="feesValue"
          value={formData.feesValue || ''}
          onChange={onInputChange}
          placeholder="0,00"
          className="border-2 border-primary"
        />
        <p className="text-xs text-muted-foreground">
          Este valor será destacado na proposta como honorários da Aliança Fiscal.
        </p>
      </div>
    </>
  );
};

export default FinancialInfoSection;
