
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
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
  companyData
}: ClientInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Dados do Cliente</h2>
      
      <div className="space-y-4">
        {/* CNPJ Section with automatic fetch indicator */}
        <div>
          <Label htmlFor="cnpj" className="flex items-center gap-2 mb-2">
            CNPJ do Cliente
            {companyData && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </Label>
          <div className="space-y-2">
            <Input
              id="cnpj"
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={onInputChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            {formData.cnpj && formData.cnpj.length >= 14 && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Dados serão buscados automaticamente
              </p>
            )}
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
              className={companyData ? "bg-blue-50 border-blue-200" : ""}
            />
            {companyData && (
              <p className="text-xs text-blue-600">Preenchido automaticamente via CNPJ</p>
            )}
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
              className={companyData ? "bg-blue-50 border-blue-200" : ""}
            />
            {companyData && (
              <p className="text-xs text-blue-600">Preenchido automaticamente via CNPJ</p>
            )}
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
              className={companyData ? "bg-blue-50 border-blue-200" : ""}
            />
            {companyData && (
              <p className="text-xs text-blue-600">Preenchido automaticamente via CNPJ</p>
            )}
          </div>
          
          <div className="space-y-2 col-span-full">
            <Label htmlFor="businessActivity">Atividade Principal</Label>
            <Input
              id="businessActivity"
              name="businessActivity"
              value={formData.businessActivity || ''}
              onChange={onInputChange}
              placeholder="Ramo de atividade da empresa"
              className={companyData ? "bg-blue-50 border-blue-200" : ""}
            />
            {companyData && (
              <p className="text-xs text-blue-600">Preenchido automaticamente via CNPJ</p>
            )}
          </div>
        </div>
      </div>
      
      <Separator className="my-6" />
    </div>
  );
};

export default ClientInfoSection;
