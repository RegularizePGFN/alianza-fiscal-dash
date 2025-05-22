
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExtractedData } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";

// Import the new component sections
import ProposalHeader from './card/sections/ProposalHeader';
import ProposalDataSection from './card/sections/ProposalDataSection';
import NegotiationDataSection from './card/sections/NegotiationDataSection';
import FeesDisplaySection from './card/sections/FeesDisplaySection';
import PaymentOptionsDisplay from './card/sections/PaymentOptionsDisplay';
import ActionButtonsSection from './card/sections/ActionButtonsSection';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: any;
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

const ProposalCard = ({ data, companyData, forwardedRef }: ProposalCardProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const proposalRef = forwardedRef || internalRef;
  const { toast } = useToast();

  return (
    <Card ref={proposalRef} className="border-border max-w-4xl mx-auto shadow-lg bg-gradient-to-br from-af-blue-50 to-white overflow-hidden">
      {/* Header with Logo */}
      <ProposalHeader
        totalDebt={data.totalDebt}
        discountedValue={data.discountedValue || '0,00'}
      />

      <CardContent className="pt-6 space-y-8 px-8 pb-8">
        {/* Contribuinte Section */}
        <ProposalDataSection data={data} />

        {/* Negociação Section */}
        <NegotiationDataSection data={data} />

        {/* Fees Section - Highlighted */}
        <FeesDisplaySection data={data} />

        {/* Payment Options */}
        <PaymentOptionsDisplay data={data} />

        <Separator className="my-6" />

        {/* Action Buttons */}
        <ActionButtonsSection 
          data={data}
          companyData={companyData}
        />
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
