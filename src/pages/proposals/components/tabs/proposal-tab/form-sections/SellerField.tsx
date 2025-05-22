
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SellerFieldProps {
  formData: Partial<ExtractedData>;
  onInputChange: (name: string, value: string) => void;
}

const SellerField = ({ formData, onInputChange }: SellerFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="sellerName">Nome do Vendedor</Label>
      <Input 
        id="sellerName" 
        value={formData.sellerName || ''} 
        onChange={(e) => onInputChange('sellerName', e.target.value)}
      />
    </div>
  );
};

export default SellerField;
