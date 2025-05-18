
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ExtractedData, PDFTemplate } from '@/lib/types/proposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, FileText, Briefcase, CreditCard, CheckSquare, Calendar } from 'lucide-react';

interface PDFTemplatePreviewProps {
  formData: Partial<ExtractedData>;
  template: PDFTemplate;
  imagePreview: string | null;
}

const PDFTemplatePreview = ({ formData, template, imagePreview }: PDFTemplatePreviewProps) => {
  // Parse template colors from formData or use defaults from selected template
  const colors = useMemo(() => {
    if (formData.templateColors && typeof formData.templateColors === 'string') {
      try {
        return JSON.parse(formData.templateColors);
      } catch (e) {
        console.error('Failed to parse template colors', e);
      }
    }
    
    return {
      primary: template.primaryColor,
      secondary: template.secondaryColor,
      accent: template.accentColor,
      background: template.backgroundColor
    };
  }, [formData.templateColors, template]);
  
  // Parse template layout from formData or use defaults from selected template
  const layout = useMemo(() => {
    if (formData.templateLayout && typeof formData.templateLayout === 'string') {
      try {
        return JSON.parse(formData.templateLayout);
      } catch (e) {
        console.error('Failed to parse template layout', e);
      }
    }
    
    return {
      sections: template.defaultLayout,
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
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

  // Generate section components based on layout
  const renderSections = () => {
    if (!layout?.sections) return null;
    
    const sectionComponents: Record<string, React.ReactNode> = {
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
                 style={{ borderColor: colors.accent, backgroundColor: `${colors.background}30` }}>
              <span className="font-medium flex items-center" style={{ color: colors.accent }}>
                <DollarSign className="mr-1 h-4 w-4" />
                Valor com Reduções:
              </span>
              <p className="text-lg font-bold" style={{ color: colors.accent }}>
                R$ {formData.discountedValue || '-'}
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
              {formData.entryInstallments && parseInt(formData.entryInstallments) > 1 ? (
                <p className="text-xs text-gray-500">Entrada: {formData.entryInstallments}x de R$ 
                {(parseFloat(formData.entryValue?.replace(/\./g, '').replace(',', '.') || '0') / 
                  parseInt(formData.entryInstallments)).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</p>
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
      metadata: (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 p-3 rounded-md border">
            <span className="text-xs font-medium flex items-center text-gray-700">
              Data de Criação:
            </span>
            <p className="text-sm">{formatDate(formData.creationDate)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border">
            <span className="text-xs font-medium flex items-center text-gray-700">
              Data de Validade:
            </span>
            <p className="text-sm">{formatDate(formData.validityDate)}</p>
          </div>
        </div>
      )
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
        
        <div className="py-3 text-center opacity-70 text-sm">
          Especialista Tributário: {specialistName}
        </div>
      </div>
    );
  };

  return (
    <Card className="border p-0 overflow-hidden shadow-md">
      <div className="p-6" style={{ backgroundColor: colors.background }}>
        {renderSections()}
      </div>
    </Card>
  );
};

export default PDFTemplatePreview;
