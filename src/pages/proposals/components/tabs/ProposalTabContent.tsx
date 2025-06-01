
import React, { useState } from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { ProposalCard } from "@/components/proposals/card";

// Import our new components
import ActionButtons from './proposal-tab/ActionButtons';
import EditModeForm from './proposal-tab/EditModeForm';
import ViewModeOptions from './proposal-tab/ViewModeOptions';

interface ProposalTabContentProps {
  formData: Partial<ExtractedData>;
  onReset: () => void;
  onInputChange: (name: string, value: string) => void;
}

const ProposalTabContent = ({
  formData,
  onReset,
  onInputChange
}: ProposalTabContentProps) => {
  // Component state
  const [isEditing, setIsEditing] = useState(false);
  const [showObservations, setShowObservations] = useState(!!formData.additionalComments);

  // Event handlers
  const handleObservationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange('additionalComments', e.target.value);
  };

  const handleShowObservationsChange = (checked: boolean) => {
    setShowObservations(checked);
    if (!checked) {
      onInputChange('additionalComments', '');
    }
  };

  const toggleEditMode = () => setIsEditing(!isEditing);
  
  return (
    <div className="space-y-6">
      {/* Action buttons (edit/reset) */}
      <ActionButtons 
        isEditing={isEditing} 
        onToggleEditMode={toggleEditMode} 
        onReset={onReset} 
      />
      
      {isEditing ? (
        /* Edit mode form */
        <EditModeForm 
          formData={formData}
          onInputChange={onInputChange}
          showObservations={showObservations}
          setShowObservations={setShowObservations}
          onExitEditMode={() => setIsEditing(false)}
        />
      ) : (
        /* View mode with proposal preview */
        <>
          {/* Options panel outside the card */}
          <ViewModeOptions 
            formData={formData}
            showObservations={showObservations}
            setShowObservations={setShowObservations}
            onObservationsChange={handleObservationsChange}
            onInputChange={onInputChange}
          />
          
          {/* Preview of the proposal */}
          <ProposalCard
            data={formData}
          />
        </>
      )}
    </div>
  );
};

export default ProposalTabContent;
