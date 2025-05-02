import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";

interface ClientFormFieldsProps {
  clientName: string;
  setClientName: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
  clientDocument: string;
  setClientDocument: (value: string) => void;
  disabled?: boolean;
}

export function ClientFormFields({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientDocument,
  setClientDocument,
  disabled = false
}: ClientFormFieldsProps) {
  
  // Format phone number to international format
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!value.startsWith('+')) {
      value = '+' + value;
    }
    
    // If it's just the + sign, keep it as is
    if (value === '+') {
      setClientPhone(value);
      return;
    }
    
    // Otherwise, format it as needed
    if (value.startsWith('+55')) {
      // Brazilian format
      if (value.length > 13) {
        // +55 21 99999-9999 format (mobile)
        value = value.slice(0, 13);
      }
    } else {
      // Generic international format, limit to reasonable length
      if (value.length > 16) {
        value = value.slice(0, 16);
      }
    }
    
    setClientPhone(value);
  };
  
  // Format CPF/CNPJ
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    
    if (value.length <= 11) {
      // Format as CPF: 000.000.000-00
      value = value
        .replace(/(\d{3})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1-');
    } else {
      // Format as CNPJ: 00.000.000/0000-00
      value = value.slice(0, 14); // Limit to 14 digits
      value = value
        .replace(/(\d{2})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1.')
        .replace(/(\d{3})(?=\d)/, '$1/')
        .replace(/(\d{4})(?=\d)/, '$1-');
    }
    
    setClientDocument(value);
  };
  
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="client_name">Client/Company Name</Label>
        <Input
          id="client_name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Full client or company name"
          disabled={disabled}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="client_phone">Phone</Label>
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
            disabled={disabled}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          International format: +55 followed by area code and number
        </p>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="client_document">CPF/CNPJ</Label>
        <Input
          id="client_document"
          value={clientDocument}
          onChange={handleDocumentChange}
          placeholder="000.000.000-00 or 00.000.000/0000-00"
          disabled={disabled}
        />
      </div>
    </>
  );
}
