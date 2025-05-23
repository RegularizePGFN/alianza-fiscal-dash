
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User } from "lucide-react";

interface ViewModeOptionsProps {
  formData: Partial<ExtractedData>;
  showObservations: boolean;
  setShowObservations: (show: boolean) => void;
  onObservationsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInputChange: (name: string, value: string) => void;
}

const ViewModeOptions = ({
  formData,
  showObservations,
  setShowObservations,
  onObservationsChange,
  onInputChange
}: ViewModeOptionsProps) => {
  const handleShowObservationsChange = (checked: boolean) => {
    setShowObservations(checked);
    if (!checked) {
      onInputChange('additionalComments', '');
    }
  };

  const handleExecutiveDataChange = (checked: boolean) => {
    onInputChange('includeExecutiveData', checked ? 'true' : 'false');
  };

  const showExecutiveData = formData.includeExecutiveData === 'true';

  return (
    <div className="space-y-4">
      {/* Observações */}
      <Card className="border-2 border-blue-400 shadow-md">
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

      {/* Dados do Executivo */}
      <Card className="border-2 border-green-400 shadow-md">
        <CardHeader className="pb-2 bg-green-50">
          <CardTitle className="text-md flex items-center">
            <User className="h-5 w-5 mr-2 text-green-500" />
            Incluir dados do executivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeExecutiveData" 
              checked={showExecutiveData} 
              onCheckedChange={handleExecutiveDataChange}
              className="h-5 w-5 border-green-400"
            />
            <Label htmlFor="includeExecutiveData" className="font-medium text-green-800">
              Incluir dados do executivo
            </Label>
          </div>
          
          {showExecutiveData && (
            <div className="space-y-3 mt-3">
              <div>
                <Label htmlFor="executiveName" className="text-sm font-medium">
                  Nome Completo
                </Label>
                <Input
                  id="executiveName"
                  value={formData.executiveName || ''}
                  onChange={(e) => onInputChange('executiveName', e.target.value)}
                  className="border-green-200 focus-visible:ring-green-400"
                  placeholder="Nome completo do executivo"
                />
              </div>
              
              <div>
                <Label htmlFor="executiveEmail" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="executiveEmail"
                  type="email"
                  value={formData.executiveEmail || ''}
                  onChange={(e) => onInputChange('executiveEmail', e.target.value)}
                  className="border-green-200 focus-visible:ring-green-400"
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="executivePhone" className="text-sm font-medium">
                  Telefone (opcional)
                </Label>
                <Input
                  id="executivePhone"
                  value={formData.executivePhone || ''}
                  onChange={(e) => onInputChange('executivePhone', e.target.value)}
                  className="border-green-200 focus-visible:ring-green-400"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewModeOptions;
