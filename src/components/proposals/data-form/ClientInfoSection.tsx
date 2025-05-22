
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, User, Building } from "lucide-react";
import { CompanyData } from "@/lib/types/proposals";
import CompanyDetailsPanel from "./CompanyDetailsPanel";

interface ClientInfoSectionProps {
  formData: {
    cnpj?: string;
    clientName?: string;
    debtNumber?: string;
    clientPhone?: string;
    clientEmail?: string;
    businessActivity?: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearchingCnpj: boolean;
  handleSearchCnpj: () => void;
  companyData: CompanyData | null;
}

const ClientInfoSection = ({
  formData,
  onInputChange,
  isSearchingCnpj,
  handleSearchCnpj,
  companyData
}: ClientInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Dados do Cliente</h2>
      
      <div className="space-y-4">
        {/* CNPJ Search Section */}
        <div>
          <Label htmlFor="cnpj" className="flex items-center gap-2 mb-2">
            CNPJ do Cliente
          </Label>
          <div className="flex gap-2">
            <Input
              id="cnpj"
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={onInputChange}
              placeholder="00.000.000/0000-00"
              className="flex-1"
              maxLength={18}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0 w-32"
              onClick={handleSearchCnpj}
              disabled={isSearchingCnpj || !formData.cnpj || formData.cnpj.length < 14}
            >
              {isSearchingCnpj ? 'Buscando...' : 'Buscar CNPJ'}
            </Button>
          </div>
        </div>
        
        {/* Display Company Data if Available */}
        {companyData && (
          <CompanyDetailsPanel companyData={companyData} />
        )}
        
        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome/Razão Social</Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName || ''}
              onChange={onInputChange}
              placeholder="Nome completo do cliente"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="debtNumber">Número do Débito</Label>
            <Input
              id="debtNumber"
              name="debtNumber"
              value={formData.debtNumber || ''}
              onChange={onInputChange}
              placeholder="Número do débito"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Telefone</Label>
            <Input
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone || ''}
              onChange={onInputChange}
              placeholder="(99) 99999-9999"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail || ''}
              onChange={onInputChange}
              placeholder="cliente@exemplo.com"
              type="email"
            />
          </div>
          
          <div className="space-y-2 col-span-full">
            <Label htmlFor="businessActivity">Atividade Principal</Label>
            <Input
              id="businessActivity"
              name="businessActivity"
              value={formData.businessActivity || ''}
              onChange={onInputChange}
              placeholder="Ramo de atividade da empresa"
            />
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
    </div>
  );
};

export default ClientInfoSection;
