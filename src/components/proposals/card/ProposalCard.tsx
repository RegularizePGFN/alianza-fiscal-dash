
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExtractedData } from "@/lib/types/proposals";
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
  const generatePdf = () => {
    // This would normally call a PDF generation library
    alert("PDF generation functionality would go here");
  };

  const printProposal = () => {
    window.print();
  };

  return (
    <Card className="border-border max-w-4xl mx-auto shadow-lg bg-gradient-to-br from-af-blue-50 to-white overflow-hidden">
      <ProposalHeader discountedValue={data.discountedValue || '0,00'} />

      <CardContent className="pt-6 space-y-8 px-8 pb-8">
        {/* Client Section */}
        <ClientSection 
          cnpj={data.cnpj || ''} 
          debtNumber={data.debtNumber || ''}
        />

        {/* Negotiation Section */}
        <NegotiationSection 
          totalDebt={data.totalDebt || '0,00'}
          discountedValue={data.discountedValue || '0,00'}
          discountPercentage={data.discountPercentage || '0'}
          entryValue={data.entryValue || '0,00'}
          installments={data.installments || '0'}
          installmentValue={data.installmentValue || '0,00'}
        />

        {/* Fees Section */}
        <FeesSection feesValue={data.feesValue || ''} />

        {/* Total Value Section */}
        <TotalValueSection 
          discountedValue={data.discountedValue || '0,00'} 
          discountPercentage={data.discountPercentage || '0'} 
        />

        {/* Payment Options */}
        <PaymentOptionsSection 
          discountedValue={data.discountedValue || '0,00'}
          installments={data.installments || '0'}
          installmentValue={data.installmentValue || '0,00'}
          entryValue={data.entryValue || '0,00'}
        />

        <Separator className="my-6" />

        {/* Action Buttons */}
        <ActionButtons onPrint={printProposal} onGeneratePdf={generatePdf} />
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
