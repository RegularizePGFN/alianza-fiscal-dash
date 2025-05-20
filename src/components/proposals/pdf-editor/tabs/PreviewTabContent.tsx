
import React from 'react';
import { SelectSpecialist, AdditionalCommentsField } from "@/components/proposals/pdf-editor";

interface PreviewTabContentProps {
  users: any[];
  selectedSpecialist: string;
  onChange: (specialist: string) => void;
  isAdmin: boolean;
  formData: any;
  onInputChange: (name: string, value: string) => void;
}

export const PreviewTabContent = ({ 
  users, 
  selectedSpecialist, 
  onChange, 
  isAdmin,
  formData,
  onInputChange
}: PreviewTabContentProps) => {
  return (
    <div className="space-y-4">
      <SelectSpecialist 
        users={users}
        selectedSpecialist={selectedSpecialist}
        onChange={onChange}
        isAdmin={isAdmin}
      />
      
      <AdditionalCommentsField
        value={formData.additionalComments || ''}
        onChange={(value) => onInputChange('additionalComments', value)}
      />
    </div>
  );
};
