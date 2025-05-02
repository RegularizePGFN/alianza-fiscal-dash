
import React from "react";
import { Phone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatPhoneNumber, formatDocumentNumber } from "./SaleFormUtils";

interface ClientFormFieldsProps {
  clientName: string;
  setClientName: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
  clientDocument: string;
  setClientDocument: (value: string) => void;
}

export function ClientFormFields({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientDocument,
  setClientDocument,
}: ClientFormFieldsProps) {

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientPhone(formatPhoneNumber(e.target.value));
  };
  
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientDocument(formatDocumentNumber(e.target.value));
  };

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="client_name">Nome do Cliente/Empresa</Label>
        <Input
          id="client_name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nome completo do cliente ou empresa"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="client_phone">Telefone</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Phone className="h-4 w-4" />
          </span>
          <Input
            id="client_phone"
            value={clientPhone}
            onChange={handlePhoneChange}
            placeholder="+5521999999999"
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Formato internacional: +55 seguido do DDD e número
        </p>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="client_document">CPF/CNPJ</Label>
        <Input
          id="client_document"
          value={clientDocument}
          onChange={handleDocumentChange}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
        />
      </div>
    </>
  );
}
