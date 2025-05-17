
import React, { useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExtractedData } from "@/lib/types/proposals";
import { fetchCnpjData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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

interface CompanyInfo {
  name?: string;
  phones?: string[];
  emails?: string[];
  businessActivity?: string;
}

const ProposalCard = ({ data }: ProposalCardProps) => {
  const { toast } = useToast();
  const proposalRef = useRef<HTMLDivElement>(null);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState<boolean>(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | undefined>();
  
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
        const formattedPhones = result.phones ? 
          result.phones.map(phone => `(${phone.area}) ${phone.number}`) : 
          [];
          
        let businessActivity = '';
        if (result.sideActivities && result.sideActivities.length > 0) {
          const activity = result.sideActivities[0];
          businessActivity = `${activity.id} | ${activity.text}`;
        } else if (result.mainActivity) {
          businessActivity = `${result.mainActivity.id} | ${result.mainActivity.text}`;
        }
        
        setCompanyInfo({
          name: result.company.name,
          phones: formattedPhones,
          emails: result.emails?.map(email => email.address),
          businessActivity: businessActivity
        });
        
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
          companyInfo={companyInfo}
          onSearchCnpj={handleSearchCnpj}
          isSearching={isSearchingCnpj}
        />

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
