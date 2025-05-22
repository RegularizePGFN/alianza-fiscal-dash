
import React, { useState } from 'react';
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { ProposalCard } from "@/components/proposals/card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw, Edit2, User, Building, Phone, Mail, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProposalTabContentProps {
  formData: Partial<ExtractedData>;
  imagePreview: string | null;
  companyData?: CompanyData | null;
  onReset: () => void;
  onInputChange: (name: string, value: string) => void;
}

const ProposalTabContent = ({
  formData,
  imagePreview,
  companyData,
  onReset,
  onInputChange
}: ProposalTabContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showObservations, setShowObservations] = useState(!!formData.additionalComments);

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
    <div className="space-y-6">
      <div className="flex justify-between mb-4">
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          {isEditing ? "Visualizar Proposta" : "Editar Dados"}
        </Button>
        
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Nova Proposta
        </Button>
      </div>
      
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editar Proposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-medium">
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input 
                    id="clientName" 
                    value={formData.clientName || ''} 
                    onChange={(e) => onInputChange('clientName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    value={formData.cnpj || ''} 
                    onChange={(e) => onInputChange('cnpj', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <Input 
                    id="clientPhone" 
                    value={formData.clientPhone || ''} 
                    onChange={(e) => onInputChange('clientPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input 
                    id="clientEmail" 
                    value={formData.clientEmail || ''} 
                    onChange={(e) => onInputChange('clientEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-md font-medium">
                Dados da Negociação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalDebt">Valor Total da Dívida</Label>
                  <Input 
                    id="totalDebt" 
                    value={formData.totalDebt || ''} 
                    onChange={(e) => onInputChange('totalDebt', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountedValue">Valor com Desconto</Label>
                  <Input 
                    id="discountedValue" 
                    value={formData.discountedValue || ''} 
                    onChange={(e) => onInputChange('discountedValue', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryValue">Valor de Entrada</Label>
                  <Input 
                    id="entryValue" 
                    value={formData.entryValue || ''} 
                    onChange={(e) => onInputChange('entryValue', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installmentValue">Valor da Parcela</Label>
                  <Input 
                    id="installmentValue" 
                    value={formData.installmentValue || ''} 
                    onChange={(e) => onInputChange('installmentValue', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Input 
                    id="installments" 
                    value={formData.installments || ''} 
                    onChange={(e) => onInputChange('installments', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feesValue">Valor dos Honorários</Label>
                  <Input 
                    id="feesValue" 
                    value={formData.feesValue || ''} 
                    onChange={(e) => onInputChange('feesValue', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Separator />

            <div className="space-y-4">
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
                  <Label htmlFor="additionalComments">Observações</Label>
                  <Textarea 
                    id="additionalComments" 
                    value={formData.additionalComments || ''} 
                    onChange={handleObservationsChange}
                    className="min-h-[100px]"
                    placeholder="Digite as observações que devem aparecer na proposta..."
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sellerName">Nome do Vendedor</Label>
              <Input 
                id="sellerName" 
                value={formData.sellerName || ''} 
                onChange={(e) => onInputChange('sellerName', e.target.value)}
              />
            </div>
            
            <Button 
              onClick={() => setIsEditing(false)} 
              className="w-full"
            >
              Visualizar Proposta Atualizada
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProposalCard
          data={formData}
          imageUrl={imagePreview || undefined}
          companyData={companyData}
        />
      )}
    </div>
  );
};

export default ProposalTabContent;
