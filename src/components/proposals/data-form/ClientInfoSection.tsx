
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Phone, Mail } from "lucide-react";

interface ClientInfoSectionProps {
  formData: Partial<ExtractedData>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearchingCnpj: boolean;
  handleSearchCnpj: () => void;
  companyData: any | null;
}

const ClientInfoSection = ({
  formData,
  onInputChange,
  isSearchingCnpj,
  handleSearchCnpj,
  companyData
}: ClientInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-slate-700 dark:text-slate-200">
        Dados do Contribuinte
      </h2>
      
      <div className="p-5 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CNPJ */}
          <div className="space-y-2">
            <label htmlFor="cnpj" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              CNPJ
            </label>
            <div className="flex gap-2">
              <Input
                id="cnpj"
                name="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj || ''}
                onChange={onInputChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSearchCnpj} 
                disabled={isSearchingCnpj || !formData.cnpj}
                className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Search className="h-4 w-4 mr-1" />
                Buscar
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Os dados da empresa serão preenchidos automaticamente após consulta
            </p>
          </div>
          
          {/* Número do Débito */}
          <div className="space-y-2">
            <label htmlFor="debtNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Número do Débito
            </label>
            <Input
              id="debtNumber"
              name="debtNumber"
              type="text"
              placeholder="000000-00"
              value={formData.debtNumber || ''}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Nome/Razão Social */}
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Nome/Razão Social
            </label>
            <Input
              id="clientName"
              name="clientName"
              type="text"
              placeholder="Razão Social"
              value={formData.clientName || ''}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Ramo de Atividade */}
          <div className="space-y-2">
            <label htmlFor="businessActivity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Ramo de Atividade
            </label>
            <Input
              id="businessActivity"
              name="businessActivity"
              type="text"
              placeholder="Ramo de atividade principal"
              value={formData.businessActivity || ''}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Telefone */}
          <div className="space-y-2">
            <label htmlFor="clientPhone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Phone className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Telefone
            </label>
            <Input
              id="clientPhone"
              name="clientPhone"
              type="text"
              placeholder="(00) 00000-0000"
              value={formData.clientPhone || ''}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="clientEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Mail className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
              Email
            </label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.clientEmail || ''}
              onChange={onInputChange}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoSection;
