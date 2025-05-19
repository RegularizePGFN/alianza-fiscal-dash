
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
}

const ProposalCard = ({ data, companyData }: ProposalCardProps) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const generatePdf = async () => {
    if (!proposalRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando PDF, aguarde um momento...",
    });
    
    try {
      await generateProposalPdf(proposalRef.current, data);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const printProposal = () => {
    window.print();
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };

  // Calculate entry installment value
  const entryInstallmentValue = () => {
    if (data.entryValue && data.entryInstallments) {
      try {
        // Converta a string de moeda para um número, substituindo ',' por '.' e removendo '.'
        const entryValue = parseFloat(data.entryValue.replace(/\./g, '').replace(',', '.'));
        const installments = parseInt(data.entryInstallments);
        
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

  // Get colors from template settings or use defaults
  const colors = (() => {
    if (data.templateColors && typeof data.templateColors === 'string') {
      try {
        return JSON.parse(data.templateColors);
      } catch (e) {}
    }
    return {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      background: '#F8FAFC'
    };
  })();

  // Get layout settings or use defaults
  const layout = (() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {}
    }
    return {
      sections: ['client', 'alert', 'debt', 'payment', 'fees'],
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  })();

  // Get specialist name
  const specialistName = data.specialistName || 'Especialista Tributário';
  
  // Format address for company data
  const formatAddress = (address?: CompanyData['address']) => {
    if (!address) return "";
    
    const parts = [
      address.street,
      address.number ? `Nº ${address.number}` : "",
      address.details || "",
      address.district ? `${address.district}` : "",
      address.city && address.state ? `${address.city}/${address.state}` : "",
      address.zip ? `CEP: ${address.zip}` : ""
    ];
    
    return parts.filter(part => part).join(", ");
  };

  // Neatly formatted sections
  const ClientSection = () => (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
          style={{ color: colors.secondary }}>
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">CNPJ:</span>
          <p className="text-base mt-1">{data.cnpj || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">Número do Débito:</span>
          <p className="text-base mt-1">{data.debtNumber || '-'}</p>
        </div>
        {data.clientName && (
          <div className="bg-gray-50 p-3 rounded col-span-2">
            <span className="text-sm font-medium text-gray-500">Razão Social:</span>
            <p className="text-base mt-1">{data.clientName}</p>
          </div>
        )}
      </div>
    </div>
  );
  
  const CompanyInfoSection = () => {
    if (!companyData || !companyData.company) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
            style={{ color: colors.secondary }}>
          Dados da Empresa
        </h3>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
          {companyData.company?.name && (
            <div className="col-span-2">
              <span className="text-sm font-medium text-gray-500">Nome/Razão Social:</span>
              <p className="text-base mt-1">{companyData.company.name}</p>
            </div>
          )}
          
          {companyData.status && (
            <div>
              <span className="text-sm font-medium text-gray-500">Situação:</span>
              <p className="text-base mt-1">{companyData.status.text}</p>
            </div>
          )}
          
          {companyData.founded && (
            <div>
              <span className="text-sm font-medium text-gray-500">Data de Abertura:</span>
              <p className="text-base mt-1">{new Date(companyData.founded).toLocaleDateString('pt-BR')}</p>
            </div>
          )}
          
          {companyData.address && (
            <div className="col-span-2">
              <span className="text-sm font-medium text-gray-500">Endereço:</span>
              <p className="text-base mt-1">{formatAddress(companyData.address)}</p>
            </div>
          )}
          
          {companyData.mainActivity && (
            <div className="col-span-2">
              <span className="text-sm font-medium text-gray-500">Atividade Principal:</span>
              <p className="text-base mt-1">{companyData.mainActivity.id} | {companyData.mainActivity.text}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const AlertSection = () => (
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
  );
  
  const NegotiationSection = () => (
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
          <p className="text-base mt-1">R$ {data.totalDebt || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded bg-green-50">
          <span className="text-sm font-medium text-green-700">
            Valor com Reduções:
          </span>
          <p className="text-base mt-1 font-medium text-green-700">R$ {data.discountedValue || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">
            Percentual de Desconto:
          </span>
          <p className="text-base mt-1">{data.discountPercentage || '-'}%</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">
            {parseInt(data.entryInstallments || '1') > 1 ? 
              `Entrada (${data.entryInstallments}x):` : 
              'Valor da Entrada:'}
          </span>
          {parseInt(data.entryInstallments || '1') > 1 ? (
            <div className="text-base mt-1">
              <p>R$ {entryInstallmentValue()} por parcela</p>
              <p className="text-sm text-gray-500">Total: R$ {data.entryValue || '0,00'}</p>
            </div>
          ) : (
            <p className="text-base mt-1">R$ {data.entryValue || '-'}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  const PaymentSection = () => (
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
          <p className="text-base mt-1 font-medium">R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded border border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            Parcelado
          </span>
          <p className="text-base mt-1 font-medium">
            {data.installments || '0'}x de R$ {data.installmentValue || '0,00'}
          </p>
          {parseInt(data.entryInstallments || '1') > 1 ? (
            <p className="text-sm text-gray-500 mt-1">Entrada: {data.entryInstallments}x de R$ {entryInstallmentValue()}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Entrada de R$ {data.entryValue || '0,00'}</p>
          )}
        </div>
      </div>
    </div>
  );
  
  const FeesSection = () => data.feesValue ? (
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
              R$ {data.feesValue}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null;
  
  const TotalSection = () => (
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
            R$ {data.discountedValue || '0,00'}
          </p>
          <div className="flex items-center justify-end text-green-300 mt-1 text-sm">
            <span>Economia de {data.discountPercentage || '0'}%</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  const CommentsSection = () => data.additionalComments ? (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
          style={{ color: colors.secondary }}>
        Observações
      </h3>
      <div className="bg-gray-50 p-3 rounded border border-gray-100">
        <p className="text-sm whitespace-pre-line">{data.additionalComments}</p>
      </div>
    </div>
  ) : null;
  
  const MetadataSection = () => (
    <div className="flex justify-between items-center text-gray-600 text-sm mb-6">
      <div>
        <span>Data: {formatDateTime(data.creationDate)}</span>
      </div>
      <div>
        <span>Validade: {formatDateTime(data.validityDate)}</span>
      </div>
    </div>
  );

  // Map sections to components
  const sectionComponents: Record<string, React.ReactNode> = {
    metadata: <MetadataSection />,
    client: <ClientSection />,
    company: <CompanyInfoSection />,
    alert: <AlertSection />,
    debt: <NegotiationSection />,
    payment: <PaymentSection />,
    fees: <FeesSection />,
    total: <TotalSection />,
    comments: <CommentsSection />
  };

  // Add "company" section to layout sections if not already there
  const layoutSections = layout?.sections || [];
  const sectionsToRender = [...layoutSections];
  if (companyData && !sectionsToRender.includes('company')) {
    // Add company after client section if it exists
    const clientIndex = sectionsToRender.indexOf('client');
    if (clientIndex !== -1) {
      sectionsToRender.splice(clientIndex + 1, 0, 'company');
    } else {
      sectionsToRender.unshift('company');
    }
  }

  return (
    <Card ref={proposalRef} className="max-w-3xl mx-auto shadow border overflow-hidden"
          style={{ backgroundColor: colors.background }}>
      
      {/* Header with Logo */}
      {layout?.showHeader && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-slate-400 to-slate-100"></div>
          <div className="relative p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {layout?.showLogo && (
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
              <span style={{ color: colors.accent }}>R$ {data.discountedValue || '0,00'}</span>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-6 space-y-0">
        {sectionsToRender.map((section, index) => (
          <React.Fragment key={index}>
            {sectionComponents[section]}
          </React.Fragment>
        ))}
        
        {/* Always show comments at the end if they exist, regardless of layout */}
        {data.additionalComments && !sectionsToRender.includes('comments') && sectionComponents.comments}
        
        {/* Signature Section */}
        {data.showSignature === "true" && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-gray-300 pb-1 mb-2"></div>
              <p className="text-sm text-gray-600">
                {specialistName}
              </p>
              <p className="text-sm text-gray-500">Especialista Tributário</p>
            </div>
          </div>
        )}
        
        {/* Footer with Specialist Name */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Especialista Tributário: {specialistName}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={printProposal} className="text-gray-700 hover:bg-gray-50">
            Imprimir
          </Button>
          <Button onClick={generatePdf} className="bg-gray-800 hover:bg-gray-900">
            Baixar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
