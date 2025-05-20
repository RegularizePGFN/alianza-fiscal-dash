import React, { useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ExtractedData, PDFTemplate, TemplateColors, TemplateLayout } from '@/lib/types/proposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatBrazilianCurrency } from '@/lib/utils';

interface PDFTemplatePreviewProps {
  formData: Partial<ExtractedData>;
  template: PDFTemplate;
  imagePreview: string | null;
}

const PDFTemplatePreview = ({ formData, template, imagePreview }: PDFTemplatePreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Parse template colors from formData or use defaults from selected template
  const colors = useMemo(() => {
    if (formData.templateColors && typeof formData.templateColors === 'string') {
      try {
        return JSON.parse(formData.templateColors) as TemplateColors;
      } catch (e) {
        console.error('Failed to parse template colors', e);
      }
    }
    
    return {
      primary: template.primaryColor,
      secondary: template.secondaryColor,
      accent: template.accentColor,
      background: template.backgroundColor
    } as TemplateColors;
  }, [formData.templateColors, template]);
  
  // Parse template layout from formData or use defaults from selected template
  const layout = useMemo(() => {
    if (formData.templateLayout && typeof formData.templateLayout === 'string') {
      try {
        return JSON.parse(formData.templateLayout) as TemplateLayout;
      } catch (e) {
        console.error('Failed to parse template layout', e);
      }
    }
    
    return {
      sections: template.defaultLayout,
      showHeader: true,
      showLogo: true,
      showWatermark: false
    } as TemplateLayout;
  }, [formData.templateLayout, template]);

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) {
      const now = new Date();
      return format(now, "dd/MM/yyyy", { locale: ptBR });
    }
    
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  // Calculate specialist name to display
  const specialistName = formData.specialistName || 'Especialista';
  
  // Calculate entry installment value
  const entryInstallmentValue = () => {
    if (formData.entryValue && formData.entryInstallments) {
      try {
        // Converta a string de moeda para um número, substituindo ',' por '.' e removendo '.'
        const entryValue = parseFloat(formData.entryValue.replace(/\./g, '').replace(',', '.'));
        const installments = parseInt(formData.entryInstallments);
        
        if (!isNaN(entryValue) && !isNaN(installments) && installments > 0) {
          const installmentValue = entryValue / installments;
          
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

  // Calculate the economy value
  const calculateEconomyValue = (): string => {
    if (!formData.totalDebt || !formData.discountedValue) return '0,00';
    
    try {
      const totalDebtValue = parseFloat(formData.totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedVal = parseFloat(formData.discountedValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(totalDebtValue) || isNaN(discountedVal)) return '0,00';
      
      const economyValue = totalDebtValue - discountedVal;
      return formatBrazilianCurrency(economyValue);
    } catch (e) {
      console.error('Error calculating economy value:', e);
      return '0,00';
    }
  };
  
  const economyValue = calculateEconomyValue();

  // Generate section components based on layout
  const renderSections = () => {
    if (!layout?.sections) return null;
    
    const sectionComponents: Record<string, React.ReactNode> = {
      metadata: (
        <div className="flex justify-between items-center text-gray-600 text-sm mb-6">
          <div>
            <span>Data: {formatDate(formData.creationDate)}</span>
          </div>
          <div>
            <span>Validade: {formatDate(formData.validityDate)}</span>
          </div>
        </div>
      ),
      client: (
        <div className="mb-6">
          <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
              style={{ color: colors.secondary }}>
            Dados do Contribuinte
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-sm font-medium text-gray-500">CNPJ:</span>
              <p className="text-base mt-1">{formData.cnpj || '-'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-sm font-medium text-gray-500">Número do Débito:</span>
              <p className="text-base mt-1">{formData.debtNumber || '-'}</p>
            </div>
            {formData.clientName && (
              <div className="bg-gray-50 p-3 rounded col-span-2">
                <span className="text-sm font-medium text-gray-500">Razão Social:</span>
                <p className="text-base mt-1">{formData.clientName}</p>
              </div>
            )}
          </div>
        </div>
      ),
      alert: (
        <div className="mb-6">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
            <div>
              <h4 className="text-base font-semibold text-amber-800 mb-1">Consequências da Dívida Ativa</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
                  <span>Protesto em Cartório - Negativação do CNPJ</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
                  <span>Execução Fiscal - Cobrança judicial da dívida</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
                  <span>Bloqueio de Contas e Bens - Sisbajud</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
                  <span>Impossibilidade de participação em licitações</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
      debt: (
        <div className="mb-6">
          <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
              style={{ color: colors.secondary }}>
            Dados da Negociação
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-sm font-medium text-gray-500">
                Valor Consolidado:
              </span>
              <p className="text-base mt-1">R$ {formData.totalDebt || '-'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded bg-green-50">
              <span className="text-sm font-medium text-green-700">
                Valor com Reduções:
              </span>
              <p className="text-base mt-1 font-medium text-green-700">R$ {formData.discountedValue || '-'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-sm font-medium text-gray-500">
                Percentual de Desconto:
              </span>
              <p className="text-base mt-1">{formData.discountPercentage || '-'}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-sm font-medium text-gray-500">
                {parseInt(formData.entryInstallments || '1') > 1 ? 
                  `Entrada (${formData.entryInstallments}x):` : 
                  'Valor da Entrada:'}
              </span>
              {parseInt(formData.entryInstallments || '1') > 1 ? (
                <div className="text-base mt-1">
                  <p>R$ {entryInstallmentValue()} por parcela</p>
                  <p className="text-sm text-gray-500">Total: R$ {formData.entryValue || '0,00'}</p>
                </div>
              ) : (
                <p className="text-base mt-1">R$ {formData.entryValue || '-'}</p>
              )}
            </div>
          </div>
        </div>
      ),
      payment: (
        <div className="mb-6">
          <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
              style={{ color: colors.secondary }}>
            Opções de Pagamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="text-sm font-medium text-gray-700">
                À Vista
              </span>
              <p className="text-base mt-1 font-medium">R$ {formData.discountedValue || '0,00'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="text-sm font-medium text-gray-700">
                Parcelado
              </span>
              <p className="text-base mt-1 font-medium">
                {formData.installments || '0'}x de R$ {formData.installmentValue || '0,00'}
              </p>
              {parseInt(formData.entryInstallments || '1') > 1 ? (
                <p className="text-sm text-gray-500 mt-1">Entrada: {formData.entryInstallments}x de R$ {entryInstallmentValue()}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Entrada de R$ {formData.entryValue || '0,00'}</p>
              )}
            </div>
          </div>
        </div>
      ),
      fees: formData.feesValue ? (
        <div className="mb-6">
          <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
              style={{ color: colors.secondary }}>
            Custos e Honorários
          </h3>
          <div className="bg-gray-50 p-3 rounded border-l-4" style={{ borderLeftColor: colors.accent }}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Honorários Aliança Fiscal:
                </span>
                <p className="text-sm mt-1 text-gray-500">
                  Especialista Tributário - {specialistName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium" style={{ color: colors.accent }}>
                  R$ {formData.feesValue}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null,
      total: (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg text-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium mb-1">
                Valor Total:
              </h3>
              <p className="text-sm opacity-80">Com reduções aplicáveis</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-medium">
                R$ {formData.discountedValue || '0,00'}
              </p>
              <div className="flex items-center justify-end text-green-300 mt-1 text-sm">
                <span>Economia de R$ {economyValue}</span>
              </div>
            </div>
          </div>
        </div>
      ),
      comments: formData.additionalComments ? (
        <div className="mb-6">
          <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
              style={{ color: colors.secondary }}>
            Observações
          </h3>
          <div className="bg-gray-50 p-3 rounded border border-gray-100">
            <p className="text-sm whitespace-pre-line">{formData.additionalComments}</p>
          </div>
        </div>
      ) : null
    };

    return (
      <div className="space-y-0 font-['Roboto',sans-serif]">
        {/* Header with geometric accent */}
        {layout.showHeader && (
          <div className="relative overflow-hidden rounded-t-lg mb-6">
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-slate-400 to-slate-100"></div>
            <div className="relative p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {layout.showLogo && (
                  <img 
                    src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                    alt="Logo" 
                    className="h-12 w-auto"
                  />
                )}
                <h2 className="text-xl font-medium" style={{ color: colors.secondary }}>
                  Proposta de Parcelamento PGFN
                </h2>
              </div>
              
              <div className="bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium">
                <span>Economia de</span>{" "}
                <span style={{ color: colors.accent }}>R$ {economyValue}</span>
              </div>
            </div>
          </div>
        )}
        
        {layout.sections.map((section, index) => (
          <React.Fragment key={index}>
            {sectionComponents[section]}
          </React.Fragment>
        ))}
        
        {/* Always show comments at the end if they exist, regardless of layout */}
        {formData.additionalComments && !layout.sections.includes('comments') && sectionComponents.comments}
        
        {/* Signature Section */}
        {formData.showSignature === "true" && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-gray-300 pb-1 mb-2"></div>
              <p className="text-sm font-medium text-gray-700">
                {specialistName}
              </p>
              <p className="text-sm text-gray-500">Especialista Tributário</p>
            </div>
          </div>
        )}
        
        {/* Footer - Only show if signature is not shown */}
        {formData.showSignature !== "true" && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>{specialistName} - Especialista Tributário</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card 
      ref={previewRef} 
      className="border p-0 overflow-hidden shadow-md preview-proposal font-['Roboto',sans-serif]"
      style={{ backgroundColor: colors.background }}
    >
      <div className="p-6">
        {renderSections()}
      </div>
    </Card>
  );
};

export default PDFTemplatePreview;
