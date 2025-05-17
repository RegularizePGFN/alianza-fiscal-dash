
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

interface ClientBasicInfoProps {
  cnpj: string;
  debtNumber: string;
  onSearchCnpj: () => void;
  isSearching: boolean;
  hasCompanyData: boolean;
}

const ClientBasicInfo = ({ 
  cnpj, 
  debtNumber, 
  onSearchCnpj, 
  isSearching,
  hasCompanyData
}: ClientBasicInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-50 border border-af-blue-100 p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-medium text-af-blue-700">CNPJ:</span>
            <p className="text-lg">{cnpj || '-'}</p>
          </div>
          {!hasCompanyData && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onSearchCnpj} 
              disabled={isSearching || !cnpj}
              className="h-8 gap-1 print:hidden"
            >
              {isSearching ? 
                <div className="animate-spin h-4 w-4 border-2 border-af-blue-700 border-t-transparent rounded-full"></div> : 
                <Search className="h-4 w-4" />
              }
              Buscar
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 border border-af-blue-100 p-4">
        <span className="font-medium text-af-blue-700">Número do Débito:</span>
        <p className="text-lg">{debtNumber || '-'}</p>
      </div>
    </div>
  );
};

export default ClientBasicInfo;
