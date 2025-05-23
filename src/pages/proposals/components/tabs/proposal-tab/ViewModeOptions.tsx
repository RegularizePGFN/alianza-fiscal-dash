
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

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
    <Card className="mb-4 border-2 border-blue-400 shadow-md">
      <CardHeader className="pb-2 bg-blue-50">
        <CardTitle className="text-md flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Adicionar observações à proposta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="showObservations" 
            checked={showObservations} 
            onCheckedChange={handleShowObservationsChange}
            className="h-5 w-5 border-blue-400"
          />
          <Label htmlFor="showObservations" className="font-medium text-blue-800">
            Incluir campo de observações
          </Label>
        </div>
        
        {showObservations && (
          <div className="space-y-2 mt-3">
            <Textarea 
              id="additionalComments" 
              value={formData.additionalComments || ''} 
              onChange={onObservationsChange}
              className="h-24 border-blue-200 focus-visible:ring-blue-400"
              placeholder="Digite as observações que devem aparecer na proposta..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ViewModeOptions;
