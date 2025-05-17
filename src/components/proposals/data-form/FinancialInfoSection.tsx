
import { Input } from "@/components/ui/input";
import { ExtractedData } from "@/lib/types/proposals";
import { CreditCard, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FinancialInfoSectionProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const FinancialInfoSection = ({ 
  formData, 
  onInputChange, 
  disabled = false 
}: FinancialInfoSectionProps) => {
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-af-blue-600" />
          Informações Financeiras
        </h3>
        <Badge className="bg-af-blue-100 hover:bg-af-blue-200 text-af-blue-700">
          Dados da Proposta
        </Badge>
      </div>
      <Separator className="my-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Valor Total da Dívida
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              placeholder="0,00"
              className="pl-8"
              name="totalDebt"
              value={formData.totalDebt || ""}
              onChange={onInputChange}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Valor Total com Reduções
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              placeholder="0,00"
              className="pl-8"
              name="discountedValue"
              value={formData.discountedValue || ""}
              onChange={onInputChange}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Percentual de Desconto
          </label>
          <div className="relative">
            <Input
              placeholder="0"
              className="pr-7"
              name="discountPercentage"
              value={formData.discountPercentage || ""}
              onChange={onInputChange}
              disabled={disabled}
            />
            <span className="absolute right-3 top-2.5 text-gray-500">%</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Honorários Sugeridos (20% da economia)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              placeholder="0,00"
              className="pl-8"
              name="feesValue"
              value={formData.feesValue || ""}
              onChange={onInputChange}
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-gray-500">
            Calculado como 20% da diferença entre o valor total e o valor com reduções
          </p>
        </div>
      </div>

      <h3 className="font-medium mt-4 flex items-center">
        <CreditCard className="h-4 w-4 mr-1 text-af-blue-600" />
        Informações de Pagamento
      </h3>
      <Separator className="my-3" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Valor da Entrada
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              placeholder="0,00"
              className="pl-8"
              name="entryValue"
              value={formData.entryValue || ""}
              onChange={onInputChange}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Entrada Parcelada Em
          </label>
          <div className="relative">
            <Input
              placeholder="1"
              className="pr-2"
              name="entryInstallments"
              value={formData.entryInstallments || "1"}
              onChange={onInputChange}
              disabled={disabled}
              type="number"
              min="1"
            />
            <span className="absolute right-3 top-2.5 text-gray-500">x</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Número do Débito
          </label>
          <Input
            placeholder="Número da dívida/processo"
            name="debtNumber"
            value={formData.debtNumber || ""}
            onChange={onInputChange}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Número de Parcelas
          </label>
          <div className="relative">
            <Input
              placeholder="0"
              className="pr-2"
              name="installments"
              value={formData.installments || ""}
              onChange={onInputChange}
              disabled={disabled}
            />
            <span className="absolute right-3 top-2.5 text-gray-500">x</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Valor da Parcela
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              placeholder="0,00"
              className="pl-8"
              name="installmentValue"
              value={formData.installmentValue || ""}
              onChange={onInputChange}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInfoSection;
