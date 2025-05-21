
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { format } from 'date-fns';
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

  // Format dates for display
  const creationDate = data.creationDate 
    ? format(new Date(data.creationDate), 'dd/MM/yyyy', { locale: ptBR })
    : format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
    
  const validityDate = data.validityDate
    ? format(new Date(data.validityDate), 'dd/MM/yyyy', { locale: ptBR })
    : format(new Date(new Date().setDate(new Date().getDate() + 7)), 'dd/MM/yyyy', { locale: ptBR });

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
