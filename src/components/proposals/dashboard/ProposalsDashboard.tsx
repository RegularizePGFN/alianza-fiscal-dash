
import React from 'react';
import { Card } from '@/components/ui/card';
import { LoadingState } from './LoadingState';
import { MonthlyProposalsChart } from './charts/MonthlyProposalsChart';
import { SalespeopleProposalsChart } from './charts/SalespeopleProposalsChart';
import { useDashboardData } from './hooks/useDashboardData';

interface ProposalsDashboardProps {
  selectedMonth?: number;
  selectedYear?: number;
}

export function ProposalsDashboard({ selectedMonth, selectedYear }: ProposalsDashboardProps) {
  const { 
    dailyProposalsData, 
    userProposalsData, 
    summaryStats, 
    isLoading 
  } = useDashboardData(selectedMonth, selectedYear);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <MonthlyProposalsChart 
        dailyProposalsData={dailyProposalsData} 
        summaryStats={summaryStats}
      />
      
      <SalespeopleProposalsChart 
        userProposalsData={userProposalsData}
      />
    </div>
  );
}
