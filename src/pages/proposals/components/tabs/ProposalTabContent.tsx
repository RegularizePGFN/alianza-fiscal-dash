import React, { useState } from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import EditModeForm from './proposal-tab/EditModeForm';
import ProposalPreviewLayout from '@/components/proposals/preview/ProposalPreviewLayout';

interface ProposalTabContentProps {
  formData: Partial<ExtractedData>;
  imagePreview: string | null;
  companyData?: CompanyData | null;
  onReset: () => void;
  onInputChange: (name: string, value: string) => void;
}

const ProposalTabContent = ({
  formData,
  companyData,
  onReset,
  onInputChange,
}: ProposalTabContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showObservations, setShowObservations] = useState(!!formData.additionalComments);

  if (isEditing) {
    return (
      <EditModeForm
        formData={formData}
        onInputChange={onInputChange}
        showObservations={showObservations}
        setShowObservations={setShowObservations}
        onExitEditMode={() => setIsEditing(false)}
      />
    );
  }

  return (
    <ProposalPreviewLayout
      formData={formData}
      companyData={companyData}
      onInputChange={onInputChange}
      onReset={onReset}
      onToggleEdit={() => setIsEditing(true)}
      isEditing={false}
    />
  );
};

export default ProposalTabContent;
