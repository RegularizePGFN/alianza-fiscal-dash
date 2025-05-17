
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Calendar } from 'lucide-react';
import { ExtractedData } from "@/lib/types/proposals";
import ProcessingIndicator from './data-form/ProcessingIndicator';
import FinancialInfoSection from './data-form/FinancialInfoSection';
import ClientInfoSection from './data-form/ClientInfoSection';
import { Input } from '@/components/ui/input';

interface DataFormProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
}

const DataForm = ({ 
  formData, 
  processing, 
  onInputChange, 
  onGenerateProposal 
}: DataFormProps) => {
  
  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
        <CardTitle className="text-lg font-medium">Dados Extraídos da Proposta</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {processing && <ProcessingIndicator />}
        
        {/* Dates Section */}
        {!processing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Clock className="h-4 w-4 text-af-blue-600" />
                Data de Criação
              </label>
              <Input 
                value={formData.creationDate || new Date().toLocaleString('pt-BR')}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Data de geração automática (não editável)</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Calendar className="h-4 w-4 text-af-blue-600" />
                Data de Validade
              </label>
              <Input 
                value={formData.validityDate || 'Calculada automaticamente (24h após criação)'}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Validade de 24h após criação (não editável)</p>
            </div>
          </div>
        )}
        
        <ClientInfoSection
          formData={formData}
          onInputChange={onInputChange}
          disabled={processing}
        />
        
        <FinancialInfoSection
          formData={formData}
          onInputChange={onInputChange}
          disabled={processing}
        />
      </CardContent>
      
      <CardFooter className="flex justify-end border-t pt-4">
        <Button
          onClick={onGenerateProposal}
          disabled={processing || !formData.cnpj || !formData.totalDebt || !formData.discountedValue}
          className="bg-af-blue-600 hover:bg-af-blue-700"
        >
          {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Gerar Proposta
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataForm;
