
import React from 'react';
import { AdditionalCommentsField, SellerInfoFields } from "@/components/proposals/pdf-editor";

interface PreviewTabContentProps {
  users: any[];
  formData: any;
  onInputChange: (name: string, value: string) => void;
}

export const PreviewTabContent = ({ 
  users, 
  formData,
  onInputChange
}: PreviewTabContentProps) => {
  return (
    <div className="space-y-4">
      <SellerInfoFields 
        value={{
          sellerName: formData.sellerName || '',
          sellerPhone: formData.sellerPhone || '',
          sellerEmail: formData.sellerEmail || '',
        }}
        onChange={(field, value) => onInputChange(field, value)}
      />
      
      <AdditionalCommentsField
        value={formData.additionalComments || ''}
        onChange={(value) => onInputChange('additionalComments', value)}
      />
    </div>
  );
};
