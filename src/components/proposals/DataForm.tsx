
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Search } from "lucide-react";
import { ExtractedData } from '@/lib/types/proposals';
import { fetchCnpjData } from '@/lib/api';

interface DataFormProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
}

const DataForm = ({ formData, processing, onInputChange, onGenerateProposal }: DataFormProps) => {
  const [isSearchingCnpj, setIsSearchingCnpj] = useState<boolean>(false);
  
  const handleSearchCnpj = async () => {
    if (!formData.cnpj) return;
    
    setIsSearchingCnpj(true);
    
    try {
      const result = await fetchCnpjData(formData.cnpj);
      
      if (result) {
        // Update form data with company information
        const event = {
          target: {
            name: 'clientName',
            value: result.company.name
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onInputChange(event);
        
        // If there's an email, use the first one
        if (result.emails && result.emails.length > 0) {
          const emailEvent = {
            target: {
              name: 'clientEmail',
              value: result.emails[0]
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          onInputChange(emailEvent);
        }
        
        // If there's a phone, use the first one
        if (result.phones && result.phones.length > 0) {
          const phone = result.phones[0];
          const phoneEvent = {
            target: {
              name: 'clientPhone',
              value: `${phone.areacode}${phone.number}`
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          onInputChange(phoneEvent);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do CNPJ:", error);
    } finally {
      setIsSearchingCnpj(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Dados da Proposta</CardTitle>
      </CardHeader>
      <CardContent>
        {processing ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Processando dados com IA...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <div className="flex gap-2">
                  <Input 
                    id="cnpj" 
                    name="cnpj"
                    value={formData.cnpj || ''}
                    onChange={onInputChange}
                    placeholder="00.000.000/0000-00"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={!formData.cnpj || isSearchingCnpj}
                    onClick={handleSearchCnpj}
                  >
                    {isSearchingCnpj ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="debtNumber">Número do Débito</Label>
                <Input 
                  id="debtNumber" 
                  name="debtNumber"
                  value={formData.debtNumber || ''}
                  onChange={onInputChange}
                  placeholder="00 0 00 000000-00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientName">Nome/Razão Social</Label>
                <Input 
                  id="clientName" 
                  name="clientName"
                  value={formData.clientName || ''}
                  onChange={onInputChange}
                  placeholder="Nome da Empresa"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input 
                  id="clientPhone" 
                  name="clientPhone"
                  value={formData.clientPhone || ''}
                  onChange={onInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input 
                  id="clientEmail" 
                  name="clientEmail"
                  value={formData.clientEmail || ''}
                  onChange={onInputChange}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="totalDebt">Valor Consolidado (R$)</Label>
                <Input 
                  id="totalDebt" 
                  name="totalDebt"
                  value={formData.totalDebt || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discountedValue">Valor com Reduções (R$)</Label>
                <Input 
                  id="discountedValue" 
                  name="discountedValue"
                  value={formData.discountedValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discountPercentage">Percentual de Desconto (%)</Label>
                <Input 
                  id="discountPercentage" 
                  name="discountPercentage"
                  value={formData.discountPercentage || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="entryValue">Valor da Entrada (R$)</Label>
                <Input 
                  id="entryValue" 
                  name="entryValue"
                  value={formData.entryValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input 
                  id="installments" 
                  name="installments"
                  value={formData.installments || ''}
                  onChange={onInputChange}
                  placeholder="0"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="installmentValue">Valor da Parcela (R$)</Label>
                <Input 
                  id="installmentValue" 
                  name="installmentValue"
                  value={formData.installmentValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="feesValue">Honorários (R$)</Label>
                <Input 
                  id="feesValue" 
                  name="feesValue"
                  value={formData.feesValue || ''}
                  onChange={onInputChange}
                  placeholder="0,00"
                  className="border-2 border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Este valor será destacado na proposta como honorários da Aliança Fiscal.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button onClick={onGenerateProposal} disabled={processing || !formData.cnpj} variant="default">
          <FileText className="mr-2 h-4 w-4" />
          Gerar Proposta
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataForm;
