
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, Loader2 } from "lucide-react";
import { CompanyData } from "@/lib/types/proposals";
import CompanyDetailsPanel from "./CompanyDetailsPanel";
import { cn } from "@/lib/utils";

interface ClientInfoSectionProps {
  formData: {
    cnpj?: string;
    clientName?: string;
    debtNumber?: string;
    clientPhone?: string;
    clientEmail?: string;
    businessActivity?: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearchingCnpj: boolean;
  handleSearchCnpj: () => void;
  companyData: CompanyData | null;
}

const RequiredMark = () => <span className="text-destructive ml-0.5">*</span>;

const ClientInfoSection = ({
  formData,
  onInputChange,
  isSearchingCnpj,
  handleSearchCnpj,
  companyData
}: ClientInfoSectionProps) => {
  const cnpjDigits = (formData.cnpj || '').replace(/\D/g, '');
  const cnpjValid = cnpjDigits.length === 14;

  // Erro inline somente após interação (touched)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const errorClass = (hasError: boolean) =>
    hasError ? 'border-destructive focus-visible:ring-destructive/40' : '';

  const cnpjError = touched.cnpj && !cnpjValid;
  const nameError = touched.clientName && !formData.clientName?.trim();
  const phoneError = touched.clientPhone && !formData.clientPhone?.trim();
  const emailError = touched.clientEmail && !formData.clientEmail?.trim();
  const activityError = touched.businessActivity && !formData.businessActivity?.trim();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Dados do Cliente</h2>

      <div className="space-y-4">
        {/* CNPJ Search Section */}
        <div>
          <Label htmlFor="cnpj" className="flex items-center gap-2 mb-2">
            CNPJ do Cliente <RequiredMark />
          </Label>
          <div className="flex gap-2">
            <Input
              id="cnpj"
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={onInputChange}
              onBlur={() => markTouched('cnpj')}
              placeholder="00.000.000/0000-00"
              className={cn('flex-1', errorClass(!!cnpjError))}
              maxLength={18}
              required
              aria-invalid={!!cnpjError}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0 w-32"
              onClick={handleSearchCnpj}
              disabled={isSearchingCnpj || !cnpjValid}
            >
              {isSearchingCnpj ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  Buscar CNPJ
                </>
              )}
            </Button>
          </div>
          {cnpjError ? (
            <p className="text-xs text-destructive mt-1">
              CNPJ obrigatório (14 dígitos). Os demais campos serão preenchidos automaticamente.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Busca automática será realizada quando o CNPJ for preenchido
            </p>
          )}
        </div>

        {/* Display Company Data if Available */}
        {companyData && (
          <CompanyDetailsPanel companyData={companyData} />
        )}

        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">
              Nome/Razão Social <RequiredMark />
            </Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName || ''}
              onChange={onInputChange}
              onBlur={() => markTouched('clientName')}
              placeholder="Nome completo do cliente"
              className={errorClass(!!nameError)}
              required
              aria-invalid={!!nameError}
            />
            {nameError && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="debtNumber">Número do Débito</Label>
            <Input
              id="debtNumber"
              name="debtNumber"
              value={formData.debtNumber || ''}
              onChange={onInputChange}
              placeholder="Número do débito"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">
              Telefone <RequiredMark />
            </Label>
            <Input
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone || ''}
              onChange={onInputChange}
              onBlur={() => markTouched('clientPhone')}
              placeholder="(99) 99999-9999"
              className={errorClass(!!phoneError)}
              required
              aria-invalid={!!phoneError}
            />
            {phoneError && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">
              Email <RequiredMark />
            </Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail || ''}
              onChange={onInputChange}
              onBlur={() => markTouched('clientEmail')}
              placeholder="cliente@exemplo.com"
              type="email"
              className={errorClass(!!emailError)}
              required
              aria-invalid={!!emailError}
            />
            {emailError && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>

          <div className="space-y-2 col-span-full">
            <Label htmlFor="businessActivity">
              Atividade Principal <RequiredMark />
            </Label>
            <Input
              id="businessActivity"
              name="businessActivity"
              value={formData.businessActivity || ''}
              onChange={onInputChange}
              onBlur={() => markTouched('businessActivity')}
              placeholder="Ramo de atividade da empresa"
              className={errorClass(!!activityError)}
              required
              aria-invalid={!!activityError}
            />
            {activityError && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>
        </div>
      </div>

      <Separator className="my-6" />
    </div>
  );
};

export default ClientInfoSection;
