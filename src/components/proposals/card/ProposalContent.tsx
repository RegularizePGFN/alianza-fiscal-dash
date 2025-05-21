
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { isValid, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientSection from './client/ClientSimpleInfo';
import { HeaderSection, MetadataSection, ProposalDataSection, NegotiationDataSection, 
         FeesDisplaySection, PaymentOptionsDisplay, AlertSection, FooterSection,
         SignatureSection, CommentsSection } from './sections';

interface ProposalContentProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  isPreview?: boolean;
}

const ProposalContent: React.FC<ProposalContentProps> = ({ 
  data, 
  companyData,
  isPreview = false
}) => {
  // Get the layout from template settings or use default
  const layout = (() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {
        console.error('Failed to parse template layout', e);
      }
    }
    return {
      sections: ['client', 'debt', 'alert', 'negotiation', 'payment', 'fees'],
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  })();

  // Função segura para formatar datas
  const safeFormatDate = (dateStr?: string) => {
    if (!dateStr) return format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
    
    try {
      // Primeiro, vamos verificar se é já um formato de data válido
      let dateObj;
      
      if (typeof dateStr === 'string') {
        if (dateStr.includes('/')) {
          // Se já está formatado como dd/MM/yyyy, usamos como está
          return dateStr;
        } else {
          // Tentamos interpretar como ISO
          dateObj = parseISO(dateStr);
        }
      } else {
        dateObj = new Date(dateStr);
      }
      
      // Verifica se a data é válida
      if (!isValid(dateObj)) {
        console.warn("Data inválida:", dateStr);
        return format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
      }
      
      return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (e) {
      console.error("Erro ao formatar data:", e, dateStr);
      return format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
    }
  };

  // Formata as datas com segurança
  const creationDate = safeFormatDate(data.creationDate);
  const validityDate = safeFormatDate(data.validityDate);

  // Render sections based on layout
  const renderSections = () => {
    return layout.sections.map((section: string) => {
      switch (section) {
        case 'client':
          return <ProposalDataSection key="client" data={data} />;
        case 'debt':
          return <NegotiationDataSection key="debt" data={data} />;
        case 'alert':
          return <AlertSection key="alert" />;
        case 'payment':
          return <PaymentOptionsDisplay key="payment" data={data} />;
        case 'fees':
          return data.feesValue ? <FeesDisplaySection key="fees" data={data} /> : null;
        case 'comments':
          return data.additionalComments ? <CommentsSection key="comments" comments={data.additionalComments} /> : null;
        case 'signature':
          return data.showSignature === 'true' ? <SignatureSection key="signature" specialistName={data.specialistName || ''} /> : null;
        default:
          return null;
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Metadata - Always show */}
      <MetadataSection 
        creationDate={creationDate}
        validityDate={validityDate}
        specialistName={data.specialistName || 'Especialista Tributário'}
        sellerName={data.sellerName}
        sellerPhone={data.sellerPhone}
        sellerEmail={data.sellerEmail}
      />

      {/* Dynamic Sections */}
      {renderSections()}

      {/* Fixed Footer (always present) */}
      <Separator className="my-4" />
      <FooterSection 
        specialistName={data.specialistName || 'Especialista Tributário'} 
      />
    </div>
  );
};

export default ProposalContent;
