
import React, { useState } from 'react';
import { AdditionalCommentsField, SellerInfoFields } from "@/components/proposals/pdf-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [showObservations, setShowObservations] = useState(!!formData.additionalComments);

  const handleObservationsChange = (value: string) => {
    onInputChange('additionalComments', value);
  };

  const handleShowObservationsChange = (checked: boolean) => {
    setShowObservations(checked);
    if (!checked) {
      onInputChange('additionalComments', '');
    }
  };

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
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="showObservationsPreview" 
            checked={showObservations} 
            onCheckedChange={handleShowObservationsChange}
          />
          <Label htmlFor="showObservationsPreview">Adicionar observações</Label>
        </div>
        
        {showObservations && (
          <div className="space-y-2">
            <Label htmlFor="additionalCommentsPreview">Observações</Label>
            <Textarea 
              id="additionalCommentsPreview" 
              value={formData.additionalComments || ''} 
              onChange={(e) => handleObservationsChange(e.target.value)}
              className="min-h-[100px]"
              placeholder="Digite as observações que devem aparecer na proposta..."
            />
          </div>
        )}
      </div>
    </div>
  );
};
