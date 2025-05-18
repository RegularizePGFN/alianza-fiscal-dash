
import React, { useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ExtractedData, PDFTemplate, TemplateColors, TemplateLayout } from '@/lib/types/proposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, FileText, Briefcase, CreditCard, CheckSquare, Calendar, Info, Percent, Clock, MessageSquare } from 'lucide-react';

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
      return format(now, "dd/MM/yyyy HH:mm", { locale: ptBR });
    }
    
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
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
        console.error("Error calculating entry installment value:", error);
      }
    }
    return "0,00";
  };

  // Generate section components based on layout
  const renderSections = () => {
    if (!layout?.sections) return null;
    
    const sectionComponents: Record<string, React.ReactNode> = {
      metadata: (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-3 rounded-md border">
            <span className="text-xs font-medium flex items-center text-gray-700">
              <Clock className="mr-1 h-3 w-3" />
              Data de Criação:
            </span>
            <p className="text-sm">{formatDate(formData.creationDate)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border">
            <span className="text-xs font-medium flex items-center text-gray-700">
              <Calendar className="mr-1 h-3 w-3" />
              Data de Validade:
            </span>
            <p className="text-sm">{formatDate(formData.validityDate)}</p>
          </div>
        </div>
      ),
      client: (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2 flex items-center" 
              style={{ color: colors.primary, borderColor: colors.primary }}>
            <Briefcase style={{ color: colors.secondary }} className="mr-2 h-5 w-5" />
            Dados do Contribuinte
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-md shadow-sm border" 
                 style={{ borderColor: colors.primary }}>
              <span className="font-medium" style={{ color: colors.secondary }}>CNPJ:</span>
              <p className="text-lg">{formData.cnpj || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border"
                 style={{ borderColor: colors.primary }}>
              <span className="font-medium" style={{ color: colors.secondary }}>Número do Débito:</span>
              <p className="text-lg">{formData.debtNumber || '-'}</p>
            </div>
            {formData.clientName && (
              <div className="bg-white p-4 rounded-md shadow-sm border col-span-2"
                   style={{ borderColor: colors.primary }}>
                <span className="font-medium" style={{ color: colors.secondary }}>Razão Social:</span>
                <p className="text-lg">{formData.clientName}</p>
              </div>
            )}
          </div>
        </div>
      ),
      alert: (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-800 text-sm mb-4">
          <div className="flex gap-2">
            <Info className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="font-semibold mb-1">Alerta! Consequências da Dívida:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bloqueio de bens e valores</li>
                <li>Impossibilidade de participação em licitações</li>
                <li>Restrição de acesso a crédito</li>
                <li>Inclusão no CADIN e negativação do CNPJ/CPF</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      debt: (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2 flex items-center"
              style={{ color: colors.primary, borderColor: colors.primary }}>
            <CheckSquare style={{ color: colors.secondary }} className="mr-2 h-5 w-5" />
            Dados da Negociação
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-md shadow-sm border"
                 style={{ borderColor: colors.primary }}>
              <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                <DollarSign className="mr-1 h-4 w-4" />
                Valor Consolidado:
              </span>
              <p className="text-lg">R$ {formData.totalDebt || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border"
                 style={{ borderColor: colors.accent, backgroundColor: `${colors.accent}10` }}>
              <span className="font-medium flex items-center" style={{ color: colors.accent }}>
                <DollarSign className="mr-1 h-4 w-4" />
                Valor com Reduções:
              </span>
              <p className="text-lg font-bold" style={{ color: colors.accent }}>
                R$ {formData.discountedValue || '-'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border"
                 style={{ borderColor: colors.primary }}>
              <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                <Percent className="mr-1 h-4 w-4" />
                Percentual de Desconto:
              </span>
              <p className="text-lg">{formData.discountPercentage || '-'}%</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border"
                 style={{ borderColor: colors.primary }}>
              <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                <DollarSign className="mr-1 h-4 w-4" />
                {parseInt(formData.entryInstallments || '1') > 1 ? 
                  `Entrada: ${formData.entryInstallments}x` : 
                  'Valor da Entrada:'}
              </span>
              <p className="text-lg">
                {parseInt(formData.entryInstallments || '1') > 1 ? 
                  `R$ ${entryInstallmentValue()} (Total: R$ ${formData.entryValue || '0,00'})` : 
                  `R$ ${formData.entryValue || '-'}`}
              </p>
            </div>
          </div>
        </div>
      ),
      payment: (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2 flex items-center"
              style={{ color: colors.primary, borderColor: colors.primary }}>
            <CreditCard style={{ color: colors.secondary }} className="mr-2 h-5 w-5" />
            Opções de Pagamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 hover:bg-slate-50 transition-colors" 
                 style={{ borderColor: colors.primary }}>
              <p className="font-medium" style={{ color: colors.secondary }}>À Vista</p>
              <p className="text-lg font-bold">R$ {formData.discountedValue || '0,00'}</p>
            </div>
            <div className="border p-4 hover:bg-slate-50 transition-colors"
                 style={{ borderColor: colors.primary }}>
              <p className="font-medium" style={{ color: colors.secondary }}>Parcelado</p>
              <p className="text-lg font-bold">{formData.installments || '0'}x de R$ {formData.installmentValue || '0,00'}</p>
              {parseInt(formData.entryInstallments || '1') > 1 ? (
                <p className="text-xs text-gray-500">Entrada: {formData.entryInstallments}x de R$ {entryInstallmentValue()}</p>
              ) : (
                <p className="text-xs text-gray-500">Entrada de R$ {formData.entryValue || '0,00'}</p>
              )}
            </div>
          </div>
        </div>
      ),
      fees: (
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-lg border-b pb-2 flex items-center"
              style={{ color: colors.primary, borderColor: colors.primary }}>
            <Calendar style={{ color: colors.secondary }} className="mr-2 h-5 w-5" />
            Custos e Honorários
          </h3>
          <div className="p-5 rounded-lg border shadow-md"
               style={{ backgroundColor: `${colors.accent}10`, borderColor: colors.accent }}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold flex items-center text-lg" style={{ color: colors.accent }}>
                  <Briefcase className="mr-2 h-5 w-5" />
                  Honorários Aliança Fiscal:
                </span>
                <p className="text-sm mt-1 opacity-80" style={{ color: colors.accent }}>
                  Especialista Tributário - {specialistName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  R$ {formData.feesValue}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      total: (
        <div className="mt-6 mb-4 p-6 rounded-lg text-white shadow-md"
             style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center">
                <DollarSign className="mr-1 h-5 w-5" />
                Valor Total:
              </h3>
              <p className="text-sm opacity-80">Incluindo todas as reduções aplicáveis</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                R$ {formData.discountedValue || '0,00'}
              </p>
              <div className="flex items-center text-green-300 mt-1">
                <Percent className="h-4 w-4 mr-1" />
                <span className="text-sm">Economia de {formData.discountPercentage || '0'}%</span>
              </div>
            </div>
          </div>
        </div>
      ),
      comments: formData.additionalComments ? (
        <div className="mt-4 mb-4 bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <h3 className="font-semibold text-sm border-b border-slate-200 pb-2 mb-2 flex items-center"
              style={{ color: colors.primary }}>
            <MessageSquare style={{ color: colors.secondary }} className="mr-2 h-4 w-4" />
            Observações
          </h3>
          <p className="text-sm whitespace-pre-line">{formData.additionalComments}</p>
        </div>
      ) : null
    };

    return (
      <div className="space-y-6">
        {layout.showHeader && (
          <div className={`py-6 px-8 rounded-t-lg text-white`} 
               style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {layout.showLogo && (
                  <img 
                    src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                    alt="Logo" 
                    className="h-14 w-auto"
                  />
                )}
                <h2 className="text-2xl font-bold">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Proposta de Parcelamento PGFN
                  </div>
                </h2>
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
        
        <div className="py-3 text-center opacity-70 text-sm">
          Especialista Tributário: {specialistName}
        </div>
      </div>
    );
  };

  return (
    <Card 
      ref={previewRef} 
      className="border p-0 overflow-hidden shadow-md preview-proposal"
      style={{ backgroundColor: colors.background }}
    >
      <div className="p-6">
        {renderSections()}
      </div>
    </Card>
  );
};

export default PDFTemplatePreview;
