
import React from 'react';
import { AdditionalCommentsField, SellerInfoFields } from "@/components/proposals/pdf-editor";

interface PreviewTabContentProps {
  users: any[];
  formData: any;
  onInputChange: (name: string, value: string) => void;
  // We no longer need these props since we removed the specialist selection
  // selectedSpecialist?: string;
  // onChange?: (specialist: string) => void;
  // isAdmin?: boolean;
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
