
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ObservationsFieldProps {
  formData: Partial<ExtractedData>;
  showObservations: boolean;
  onObservationsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onShowObservationsChange: (checked: boolean) => void;
}

const ObservationsField = ({ 
  formData, 
  showObservations, 
  onObservationsChange, 
  onShowObservationsChange 
}: ObservationsFieldProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="showObservations" 
          checked={showObservations} 
          onCheckedChange={onShowObservationsChange}
        />
        <Label htmlFor="showObservations">Adicionar observações</Label>
      </div>
      
      {showObservations && (
        <div className="space-y-2">
          <Label htmlFor="additionalComments">Observações</Label>
          <Textarea 
            id="additionalComments" 
            value={formData.additionalComments || ''} 
            onChange={onObservationsChange}
            className="min-h-[100px]"
            placeholder="Digite as observações que devem aparecer na proposta..."
          />
        </div>
      )}
    </div>
  );
};

export default ObservationsField;
