
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ViewModeOptionsProps {
  formData: Partial<ExtractedData>;
  showObservations: boolean;
  setShowObservations: (show: boolean) => void;
  onObservationsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ViewModeOptions = ({
  formData,
  showObservations,
  setShowObservations,
  onObservationsChange
}: ViewModeOptionsProps) => {
  const handleShowObservationsChange = (checked: boolean) => {
    setShowObservations(checked);
    if (!checked) {
      // This will be handled by the parent component
      // by passing in a callback function
    }
  };

  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="showObservations" 
          checked={showObservations} 
          onCheckedChange={handleShowObservationsChange}
        />
        <Label htmlFor="showObservations">Adicionar observações</Label>
      </div>
      
      {showObservations && (
        <div className="space-y-2">
          <Textarea 
            id="additionalComments" 
            value={formData.additionalComments || ''} 
            onChange={onObservationsChange}
            className="h-20"
            placeholder="Digite as observações que devem aparecer na proposta..."
          />
        </div>
      )}
    </div>
  );
};

export default ViewModeOptions;
