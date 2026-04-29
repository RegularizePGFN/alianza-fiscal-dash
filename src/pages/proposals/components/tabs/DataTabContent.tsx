import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { ClientInfoSection, FinancialInfoSection } from "@/components/proposals/data-form";
import { ArrowRight, Sparkles, User, Calculator, Loader2 } from "lucide-react";
import { useCnpjSearch } from "@/components/proposals/data-form/useCnpjSearch";

interface DataTabContentProps {
  formData: Partial<ExtractedData>;
  processing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateProposal: () => void;
  setProcessingStatus: (status: string) => void;
  companyData?: CompanyData | null;
  searchCnpj?: (cnpj: string) => void;
  isSearchingCnpj?: boolean;
}

const DataTabContent = ({
  formData,
  processing,
  onInputChange,
  onGenerateProposal,
  setProcessingStatus,
  companyData,
  searchCnpj,
  isSearchingCnpj = false,
}: DataTabContentProps) => {
  const { isSearchingCnpj: hookIsSearching, companyData: hookCompanyData, handleSearchCnpj } =
    useCnpjSearch({ formData, onInputChange, setProcessingStatus });

  const finalIsSearching = isSearchingCnpj || hookIsSearching;
  const finalCompanyData = companyData || hookCompanyData;
  const finalHandleSearch = searchCnpj ? () => searchCnpj(formData.cnpj || '') : handleSearchCnpj;

  const calculateEntryInstallmentValue = () => formData.entryValue || '0,00';

  useEffect(() => {
    setProcessingStatus("Dados extraídos com sucesso!");
  }, [setProcessingStatus]);

  // Validação de campos obrigatórios do cliente
  const cnpjDigits = (formData.cnpj || '').replace(/\D/g, '');
  const missing: string[] = [];
  if (cnpjDigits.length !== 14) missing.push('CNPJ');
  if (!formData.clientName?.trim()) missing.push('Nome/Razão Social');
  if (!formData.clientPhone?.trim()) missing.push('Telefone');
  if (!formData.clientEmail?.trim()) missing.push('Email');
  if (!formData.businessActivity?.trim()) missing.push('Atividade Principal');
  const isClientDataValid = missing.length === 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-success/20 bg-gradient-to-r from-success/10 via-success/5 to-transparent p-4 flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Dados extraídos pela IA</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Revise as informações abaixo. Você pode editar qualquer campo antes de gerar a proposta.
          </p>
        </div>
      </div>

      {/* Cliente */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold">Dados do Cliente</h2>
          </div>
          <ClientInfoSection
            formData={formData}
            onInputChange={onInputChange}
            isSearchingCnpj={finalIsSearching}
            handleSearchCnpj={finalHandleSearch}
            companyData={finalCompanyData}
          />
        </CardContent>
      </Card>

      {/* Financeiro */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calculator className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold">Dados Financeiros</h2>
          </div>
          <FinancialInfoSection
            formData={formData}
            onInputChange={onInputChange}
            disabled={false}
            entryInstallmentValue={calculateEntryInstallmentValue()}
          />
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="sticky bottom-4 z-10">
        <div className="rounded-xl border bg-card shadow-lg p-4 flex items-center justify-between gap-4">
          <div className="text-sm hidden sm:block">
            {isClientDataValid ? (
              <span className="text-muted-foreground">
                Tudo certo? Gere a pré-visualização da proposta para personalizar e baixar.
              </span>
            ) : (
              <span className="text-destructive">
                Preencha os campos obrigatórios: {missing.join(', ')}.
              </span>
            )}
          </div>
          <Button
            size="lg"
            className="ml-auto gap-2 bg-primary hover:bg-primary/90 shadow-md"
            onClick={onGenerateProposal}
            disabled={processing || !isClientDataValid}
            title={!isClientDataValid ? `Faltam: ${missing.join(', ')}` : undefined}
          >
            Gerar Proposta
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTabContent;
