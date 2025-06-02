
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesSummaryCard } from '@/components/dashboard/SalesSummaryCard';
import { FileText, DollarSign, TrendingDown, Calculator, Calendar } from 'lucide-react';
import { Proposal } from '@/lib/types/proposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalsSummaryCardsProps {
  proposals: Proposal[];
}

export function ProposalsSummaryCards({ proposals }: ProposalsSummaryCardsProps) {
  // Calculate summary metrics
  const totalProposals = proposals.length;
  
  const todayProposals = proposals.filter(proposal => {
    const today = new Date().toISOString().split('T')[0];
    const proposalDate = proposal.createdAt.split('T')[0];
    return proposalDate === today;
  }).length;

  const totalConsolidatedValue = proposals.reduce((sum, proposal) => {
    const value = parseFloat(proposal.data.totalDebt.replace(/[^\d,]/g, '').replace(',', '.'));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const totalDiscountedValue = proposals.reduce((sum, proposal) => {
    const value = parseFloat(proposal.data.discountedValue.replace(/[^\d,]/g, '').replace(',', '.'));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const totalFeesValue = proposals.reduce((sum, proposal) => {
    const value = parseFloat(proposal.data.feesValue.replace(/[^\d,]/g, '').replace(',', '.'));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const averageDiscount = proposals.length > 0 
    ? proposals.reduce((sum, proposal) => {
        const discount = parseFloat(proposal.data.discountPercentage.replace(',', '.'));
        return sum + (isNaN(discount) ? 0 : discount);
      }, 0) / proposals.length
    : 0;

  // Format average discount to 2 decimal places
  const formattedAverageDiscount = Number(averageDiscount.toFixed(2));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <SalesSummaryCard
        title="Total de Propostas"
        numericValue={totalProposals}
        hideAmount={true}
        icon={<FileText className="h-4 w-4" />}
        description="Propostas cadastradas no período"
      />
      
      <SalesSummaryCard
        title="Propostas Hoje"
        numericValue={todayProposals}
        hideAmount={true}
        icon={<Calendar className="h-4 w-4" />}
        description="Propostas criadas hoje"
      />
      
      <SalesSummaryCard
        title="Valor Consolidado Total"
        amount={totalConsolidatedValue}
        icon={<DollarSign className="h-4 w-4" />}
        description="Soma de todos os valores consolidados"
      />
      
      <SalesSummaryCard
        title="Valor com Reduções Total"
        amount={totalDiscountedValue}
        icon={<TrendingDown className="h-4 w-4" />}
        description="Soma de todos os valores com desconto"
      />
      
      <SalesSummaryCard
        title="Total de Honorários"
        amount={totalFeesValue}
        icon={<Calculator className="h-4 w-4" />}
        description="Soma de todos os honorários"
      />
      
      <SalesSummaryCard
        title="Desconto Médio"
        numericValue={formattedAverageDiscount}
        hideAmount={true}
        icon={<TrendingDown className="h-4 w-4" />}
        description={`${formattedAverageDiscount}% de desconto médio`}
      />
    </div>
  );
}
