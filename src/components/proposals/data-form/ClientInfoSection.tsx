
import React, { useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ExtractedData } from '@/lib/types/proposals';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface ClientInfoSectionProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearchingCnpj: boolean;
  handleSearchCnpj: () => void;
  companyData: any;
}

const ClientInfoSection = ({ 
  formData, 
  onInputChange, 
  isSearchingCnpj, 
  handleSearchCnpj,
  companyData 
}: ClientInfoSectionProps) => {
  // Format CNPJ as user types
  const formatCnpj = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '');
    
    if (!onlyDigits) return '';
    
    // Format CNPJ as XX.XXX.XXX/XXXX-XX
    if (onlyDigits.length <= 2) {
      return onlyDigits;
    } else if (onlyDigits.length <= 5) {
      return `${onlyDigits.slice(0, 2)}.${onlyDigits.slice(2)}`;
    } else if (onlyDigits.length <= 8) {
      return `${onlyDigits.slice(0, 2)}.${onlyDigits.slice(2, 5)}.${onlyDigits.slice(5)}`;
    } else if (onlyDigits.length <= 12) {
      return `${onlyDigits.slice(0, 2)}.${onlyDigits.slice(2, 5)}.${onlyDigits.slice(5, 8)}/${onlyDigits.slice(8)}`;
    } else {
      return `${onlyDigits.slice(0, 2)}.${onlyDigits.slice(2, 5)}.${onlyDigits.slice(5, 8)}/${onlyDigits.slice(8, 12)}-${onlyDigits.slice(12, 14)}`;
    }
  };

  // Handle CNPJ input with auto-formatting
  const handleCnpjInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCnpj = formatCnpj(e.target.value);
    
    const event = {
      target: {
        name: 'cnpj',
        value: formattedCnpj
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(event);
  };

  // Automatically search CNPJ when it's 14 digits
  useEffect(() => {
    const cnpj = formData.cnpj?.replace(/\D/g, '') || '';
    if (cnpj.length === 14 && !companyData) {
      handleSearchCnpj();
    }
  }, [formData.cnpj]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="cnpj">CNPJ</Label>
          <div className="flex mt-1">
            <Input 
              id="cnpj" 
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={handleCnpjInput}
              placeholder="00.000.000/0000-00"
              className="flex-1"
            />
            <Button 
              className="ml-2 whitespace-nowrap"
              variant="outline" 
              onClick={handleSearchCnpj}
              disabled={isSearchingCnpj || !formData.cnpj}
            >
              {isSearchingCnpj ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Os dados da empresa serão preenchidos automaticamente após consulta
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Nome/Razão Social</Label>
          <Input 
            id="clientName" 
            name="clientName"
            value={formData.clientName || ''}
            onChange={onInputChange}
            placeholder="Nome da Empresa"
            className={companyData ? "bg-slate-50" : ""}
            disabled={!!companyData}
          />
          {companyData && (
            <p className="text-xs text-slate-500">
              Preenchido automaticamente pela consulta de CNPJ
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessActivity">Ramo de Atividade</Label>
          <Input 
            id="businessActivity" 
            name="businessActivity"
            value={formData.businessActivity || ''}
            onChange={onInputChange}
            placeholder="Código | Descrição da Atividade"
            className={companyData ? "bg-slate-50" : ""}
            disabled={!!companyData}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientPhone">Telefone</Label>
          <Input 
            id="clientPhone" 
            name="clientPhone"
            value={formData.clientPhone || ''}
            onChange={onInputChange}
            placeholder="(00) 00000-0000"
            className={companyData?.phones?.length ? "bg-slate-50" : ""}
            disabled={!!companyData?.phones?.length}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input 
            id="clientEmail" 
            name="clientEmail"
            value={formData.clientEmail || ''}
            onChange={onInputChange}
            placeholder="email@exemplo.com"
            className={companyData?.emails?.length ? "bg-slate-50" : ""}
            disabled={!!companyData?.emails?.length}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="debtNumber">Número do Débito</Label>
        <Input 
          id="debtNumber" 
          name="debtNumber"
          value={formData.debtNumber || ''}
          onChange={onInputChange}
          placeholder="00 0 00 000000-00"
        />
      </div>
    </div>
  );
};

export default ClientInfoSection;
