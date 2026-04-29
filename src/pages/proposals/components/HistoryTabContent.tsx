import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';
import { Proposal } from '@/lib/types/proposals';
import ProposalHistory from '@/components/proposals/ProposalHistory';
import { ProposalsSummaryCards } from '@/components/proposals/ProposalsSummaryCards';
import {
  ProposalsDateFilter,
  DateFilterType,
  DateRange,
} from '@/components/proposals/ProposalsDateFilter';
import { ProposalsDashboard } from '@/components/proposals/dashboard';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';

interface HistoryTabContentProps {
  proposals: Proposal[];
  loadingProposals: boolean;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
  filterType: DateFilterType;
  customDateRange: DateRange;
  onFilterChange: (type: DateFilterType, range?: DateRange) => void;
  onMount: () => void;
}

const HistoryTabContent: React.FC<HistoryTabContentProps> = ({
  proposals,
  loadingProposals,
  onViewProposal,
  onDeleteProposal,
  filterType,
  customDateRange,
  onFilterChange,
  onMount,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  // Dispara fetch só quando a aba for montada
  useEffect(() => {
    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {isAdmin && <ProposalsDashboard />}

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Histórico de propostas</h2>
              <p className="text-xs text-muted-foreground">
                Filtre por período e acesse propostas anteriores
              </p>
            </div>
          </div>
          <ProposalsDateFilter
            filterType={filterType}
            dateRange={customDateRange}
            onFilterChange={onFilterChange}
          />
        </div>

        <ProposalsSummaryCards proposals={proposals} />

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <ProposalHistory
              proposals={proposals}
              loading={loadingProposals}
              onViewProposal={onViewProposal}
              onDeleteProposal={onDeleteProposal}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoryTabContent;
