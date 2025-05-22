
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ClientInfoFields from './form-sections/ClientInfoFields';
import NegotiationFields from './form-sections/NegotiationFields';
import ObservationsField from './form-sections/ObservationsField';
import SellerField from './form-sections/SellerField';

interface EditModeFormProps {
  formData: Partial<ExtractedData>;
  onInputChange: (name: string, value: string) => void;
  showObservations: boolean;
  setShowObservations: (show: boolean) => void;
  onExitEditMode: () => void;
}

const EditModeForm = ({
  formData,
  onInputChange,
  showObservations,
  setShowObservations,
  onExitEditMode
}: EditModeFormProps) => {
  const handleObservationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange('additionalComments', e.target.value);
  };

  const handleShowObservationsChange = (checked: boolean) => {
    setShowObservations(checked);
    if (!checked) {
      onInputChange('additionalComments', '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Editar Proposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ClientInfoFields 
          formData={formData} 
          onInputChange={onInputChange} 
        />
        
        <Separator />
        
        <NegotiationFields 
          formData={formData} 
          onInputChange={onInputChange} 
        />
        
        <Separator />

        <ObservationsField 
          formData={formData}
          showObservations={showObservations}
          onObservationsChange={handleObservationsChange}
          onShowObservationsChange={handleShowObservationsChange}
        />
        
        <SellerField 
          formData={formData} 
          onInputChange={onInputChange} 
        />
        
        <Button 
          onClick={onExitEditMode} 
          className="w-full"
        >
          Visualizar Proposta Atualizada
        </Button>
      </CardContent>
    </Card>
  );
};

export default EditModeForm;
