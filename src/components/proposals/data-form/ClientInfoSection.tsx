
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ExtractedData } from '@/lib/types/proposals';

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
  companyData 
}: ClientInfoSectionProps) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input 
          id="cnpj" 
          name="cnpj"
          value={formData.cnpj || ''}
          onChange={onInputChange}
          placeholder="00.000.000/0000-00"
          className="flex-1"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="debtNumber">Número do Débito</Label>
        <Input 
          id="debtNumber" 
          name="debtNumber"
          value={formData.debtNumber || ''}
          onChange={onInputChange}
          placeholder="00 0 00 000000-00"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="clientName">Nome/Razão Social</Label>
        <Input 
          id="clientName" 
          name="clientName"
          value={formData.clientName || ''}
          onChange={onInputChange}
          placeholder="Nome da Empresa"
          className={companyData ? "bg-slate-50" : ""}
          readOnly={!!companyData}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="businessActivity">Ramo de Atividade</Label>
        <Input 
          id="businessActivity" 
          name="businessActivity"
          value={formData.businessActivity || ''}
          onChange={onInputChange}
          placeholder="Código | Descrição da Atividade"
          className={companyData ? "bg-slate-50" : ""}
          readOnly={!!companyData}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="clientPhone">Telefone</Label>
        <Input 
          id="clientPhone" 
          name="clientPhone"
          value={formData.clientPhone || ''}
          onChange={onInputChange}
          placeholder="(00) 00000-0000"
          className={companyData?.phones?.length ? "bg-slate-50" : ""}
          readOnly={!!companyData?.phones?.length}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="clientEmail">Email</Label>
        <Input 
          id="clientEmail" 
          name="clientEmail"
          value={formData.clientEmail || ''}
          onChange={onInputChange}
          placeholder="email@exemplo.com"
          className={companyData?.emails?.length ? "bg-slate-50" : ""}
          readOnly={!!companyData?.emails?.length}
        />
      </div>
    </>
  );
};

export default ClientInfoSection;
