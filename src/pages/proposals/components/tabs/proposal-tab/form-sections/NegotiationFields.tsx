
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NegotiationFieldsProps {
  formData: Partial<ExtractedData>;
  onInputChange: (name: string, value: string) => void;
}

const NegotiationFields = ({ formData, onInputChange }: NegotiationFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">
        Dados da Negociação
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalDebt">Valor Total da Dívida</Label>
          <Input 
            id="totalDebt" 
            value={formData.totalDebt || ''} 
            onChange={(e) => onInputChange('totalDebt', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountedValue">Valor com Desconto</Label>
          <Input 
            id="discountedValue" 
            value={formData.discountedValue || ''} 
            onChange={(e) => onInputChange('discountedValue', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entryValue">Valor de Entrada</Label>
          <Input 
            id="entryValue" 
            value={formData.entryValue || ''} 
            onChange={(e) => onInputChange('entryValue', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="installmentValue">Valor da Parcela</Label>
          <Input 
            id="installmentValue" 
            value={formData.installmentValue || ''} 
            onChange={(e) => onInputChange('installmentValue', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="installments">Número de Parcelas</Label>
          <Input 
            id="installments" 
            value={formData.installments || ''} 
            onChange={(e) => onInputChange('installments', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feesValue">Valor dos Honorários</Label>
          <Input 
            id="feesValue" 
            value={formData.feesValue || ''} 
            onChange={(e) => onInputChange('feesValue', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default NegotiationFields;
