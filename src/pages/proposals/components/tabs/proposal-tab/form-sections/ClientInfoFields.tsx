
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientInfoFieldsProps {
  formData: Partial<ExtractedData>;
  onInputChange: (name: string, value: string) => void;
}

const ClientInfoFields = ({ formData, onInputChange }: ClientInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">
        Dados do Cliente
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Nome do Cliente</Label>
          <Input 
            id="clientName" 
            value={formData.clientName || ''} 
            onChange={(e) => onInputChange('clientName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input 
            id="cnpj" 
            value={formData.cnpj || ''} 
            onChange={(e) => onInputChange('cnpj', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientPhone">Telefone</Label>
          <Input 
            id="clientPhone" 
            value={formData.clientPhone || ''} 
            onChange={(e) => onInputChange('clientPhone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email</Label>
          <Input 
            id="clientEmail" 
            value={formData.clientEmail || ''} 
            onChange={(e) => onInputChange('clientEmail', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientInfoFields;
