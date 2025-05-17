
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { fetchCnpjData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from 'lucide-react';
import ProposalHeader from './ProposalHeader';
import ClientSection from './ClientSection';
import NegotiationSection from './NegotiationSection';
import FeesSection from './FeesSection';
import TotalValueSection from './TotalValueSection';
import PaymentOptionsSection from './PaymentOptionsSection';
import ActionButtons from './ActionButtons';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
}

const ProposalCard = ({ data }: ProposalCardProps) => {
  const { toast } = useToast();
  const proposalRef = useRef<HTMLDivElement>(null);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState<boolean>(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  
  // Auto-search CNPJ when component mounts
  useEffect(() => {
    if (data.cnpj && !companyData) {
      handleSearchCnpj();
    }
  }, [data.cnpj]);
  
  const printProposal = () => {
    window.print();
  };

  const handleSearchCnpj = async () => {
    if (!data.cnpj) {
      toast({
        title: "CNPJ não encontrado",
        description: "Insira um CNPJ válido para realizar a consulta.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearchingCnpj(true);
    
    try {
      const result = await fetchCnpjData(data.cnpj);
      
      if (result) {
        setCompanyData(result);
        toast({
          title: "Dados obtidos com sucesso",
          description: `Informações de ${result.company.name} carregadas.`
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do CNPJ:", error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível obter os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  return (
    <Card ref={proposalRef} className="border max-w-4xl mx-auto shadow-lg bg-white print:shadow-none print:border-none">
      <ProposalHeader discountedValue={data.discountedValue || '0,00'} />

      <CardContent className="pt-6 space-y-8 px-8 pb-8">
        <ClientSection 
          cnpj={data.cnpj || ''} 
          debtNumber={data.debtNumber || ''}
          businessActivity={data.businessActivity}
          companyData={companyData}
          onSearchCnpj={handleSearchCnpj}
          isSearching={isSearchingCnpj}
        />

        {/* Alerta sobre consequências de não regularizar a dívida */}
        <div className="bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="text-amber-500 h-5 w-5 mr-2" />
            <h3 className="font-semibold text-amber-800">Consequências da Dívida Ativa</h3>
          </div>
          <p className="text-sm text-amber-700 mb-3">
            Negociar sua dívida ativa evita complicações jurídicas e financeiras sérias. Ao deixar um débito sem regularização, sua empresa pode sofrer as seguintes penalidades:
          </p>
          
          <div className="space-y-2 text-sm pl-2">
            <div>
              <p className="font-medium text-amber-800">Protesto em Cartório</p>
              <p className="text-amber-700 text-sm">
                O CNPJ é negativado, dificultando crédito, financiamentos e participação em licitações.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-amber-800">Execução Fiscal</p>
              <p className="text-amber-700 text-sm">
                A PGFN pode cobrar judicialmente a dívida, com acréscimos legais e risco de penhora.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-amber-800">Bloqueio de Contas e Bens</p>
              <p className="text-amber-700 text-sm">
                A Justiça pode bloquear valores bancários e bens em nome do devedor (via Sisbajud).
              </p>
            </div>
          </div>
        </div>

        <NegotiationSection 
          totalDebt={data.totalDebt || '0,00'}
          discountedValue={data.discountedValue || '0,00'}
          discountPercentage={data.discountPercentage || '0'}
          entryValue={data.entryValue || '0,00'}
          installments={data.installments || '0'}
          installmentValue={data.installmentValue || '0,00'}
        />

        <FeesSection feesValue={data.feesValue || ''} />

        <TotalValueSection 
          discountedValue={data.discountedValue || '0,00'} 
          discountPercentage={data.discountPercentage || '0'} 
        />

        <PaymentOptionsSection 
          discountedValue={data.discountedValue || '0,00'}
          installments={data.installments || '0'}
          installmentValue={data.installmentValue || '0,00'}
          entryValue={data.entryValue || '0,00'}
        />

        <Separator className="my-6" />

        <div className="text-xs text-gray-500 italic mt-8 pt-2 border-t border-gray-200">
          Embora a dívida tenha prazo de prescrição, esse prazo é suspenso ou interrompido com o ajuizamento, mantendo o débito em aberto por tempo indeterminado.
        </div>

        <ActionButtons 
          onPrint={printProposal} 
          proposalData={data}
          proposalRef={proposalRef}
        />
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
