
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Calendar, Search } from 'lucide-react';
import { ExtractedData } from "@/lib/types/proposals";
import ProcessingIndicator from './data-form/ProcessingIndicator';
import FinancialInfoSection from './data-form/FinancialInfoSection';
import ClientInfoSection from './data-form/ClientInfoSection';
import { Input } from '@/components/ui/input';
import { useCnpjSearch } from './data-form/useCnpjSearch';
import { useAuth } from '@/contexts/auth';

interface DataFormProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
  setProcessingStatus: (status: string) => void;
}

const DataForm = ({ 
  formData, 
  processing, 
  onInputChange, 
  onGenerateProposal,
  setProcessingStatus
}: DataFormProps) => {
  const { user } = useAuth();
  
  const {
    isSearchingCnpj,
    companyData,
    handleSearchCnpj,
    setCompanyData
  } = useCnpjSearch({ 
    formData, 
    onInputChange,
    setProcessingStatus
  });

  // Set specialist name when form loads
  useState(() => {
    if (!formData.specialistName && user?.name) {
      const event = {
        target: {
          name: 'specialistName',
          value: user.name
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }
  });
  
  // Format currency when user inputs values
  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only process currency fields
    if (['totalDebt', 'discountedValue', 'entryValue', 'installmentValue', 'feesValue'].includes(name)) {
      // Remove everything except digits and comma
      const cleaned = value.replace(/[^\d,]/g, '');
      
      // Split by comma to get the decimal part
      const parts = cleaned.split(',');
      
      if (parts.length > 1) {
        // Ensure maximum of 2 decimal digits
        const decimals = parts[1].substring(0, 2);
        const formattedValue = `${parts[0]},${decimals}`;
        
        // Create a synthetic event
        const syntheticEvent = {
          target: {
            name,
            value: formattedValue
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onInputChange(syntheticEvent);
      } else {
        onInputChange(e);
      }
    } else {
      // For non-currency fields, just pass through
      onInputChange(e);
    }
  };

  // Calculate entry installment value
  const calculateEntryInstallmentValue = () => {
    if (formData.entryValue && formData.entryInstallments) {
      try {
        // Converta a string de moeda para um número, substituindo ',' por '.' e removendo '.'
        const entryValue = parseFloat(formData.entryValue.replace(/\./g, '').replace(',', '.'));
        const installments = parseInt(formData.entryInstallments);
        
        if (!isNaN(entryValue) && !isNaN(installments) && installments > 0) {
          const installmentValue = entryValue / installments;
          
          // Formatar com precisão de 2 casas decimais
          return installmentValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      } catch (error) {
        console.error("Erro ao calcular o valor da parcela de entrada:", error);
      }
    }
    return "0,00";
  };

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Dados Extraídos da Proposta</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {processing && <ProcessingIndicator processing={processing} />}
        
        {/* Dates Section */}
        {!processing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
                Data de Criação
              </label>
              <Input 
                value={formData.creationDate || new Date().toLocaleString('pt-BR')}
                disabled
                className="bg-slate-50 dark:bg-gray-800"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Data de geração automática</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-af-blue-600 dark:text-af-blue-400" />
                Data de Validade
              </label>
              <Input 
                value={formData.validityDate || 'Calculada automaticamente (24h após criação)'}
                disabled
                className="bg-slate-50 dark:bg-gray-800"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Validade de 24h após criação</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                Especialista Tributário
              </label>
              <Input 
                value={formData.specialistName || user?.name || ''}
                disabled
                className="bg-slate-50 dark:bg-gray-800"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.role === 'admin' ? 'Pode ser alterado na aba "Edite o PDF"' : 'Nome do especialista responsável'}
              </p>
            </div>
          </div>
        )}
        
        <ClientInfoSection
          formData={formData}
          onInputChange={handleCurrencyInput}
          isSearchingCnpj={isSearchingCnpj}
          handleSearchCnpj={handleSearchCnpj}
          companyData={companyData}
        />
        
        <FinancialInfoSection
          formData={formData}
          onInputChange={handleCurrencyInput}
          disabled={processing}
          entryInstallmentValue={calculateEntryInstallmentValue()}
        />
      </CardContent>
      
      <CardFooter className="flex justify-end border-t pt-4 dark:border-gray-700">
        <Button
          onClick={onGenerateProposal}
          disabled={processing || !formData.cnpj || !formData.totalDebt || !formData.discountedValue}
          className="bg-af-blue-600 hover:bg-af-blue-700"
        >
          {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Continuar para Edição de PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataForm;
