
import { ExtractedData, Proposal } from "@/lib/types/proposals";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import ProposalHistory from "@/components/proposals/ProposalHistory";
import { ProposalsSummaryCards } from "@/components/proposals/ProposalsSummaryCards";
import { ProposalsDateFilter, DateFilterType, DateRange } from "@/components/proposals/ProposalsDateFilter";
import { ProposalsDuplicateChecker } from "@/components/proposals/ProposalsDuplicateChecker";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadTabContentProps {
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  progressPercent: number;
  setProgressPercent: (percent: number) => void;
  proposals: Proposal[];
  loadingProposals: boolean;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  setProcessingStatus: (status: string) => void;
  filterType: DateFilterType;
  customDateRange: DateRange;
  onFilterChange: (type: DateFilterType, range?: DateRange) => void;
}

const UploadTabContent = ({
  processing,
  setProcessing,
  progressPercent,
  setProgressPercent,
  proposals,
  loadingProposals,
  onViewProposal,
  onDeleteProposal,
  onProcessComplete,
  setProcessingStatus,
  filterType,
  customDateRange,
  onFilterChange
}: UploadTabContentProps) => {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <AIImageProcessor
          onProcessComplete={onProcessComplete}
          processing={processing}
          setProcessing={setProcessing}
          progressPercent={progressPercent}
          setProgressPercent={setProgressPercent}
          updateStatus={setProcessingStatus}
        />
      </div>
      
      <Separator className="my-8" />
      
      {/* Duplicate Checker Alert */}
      <ProposalsDuplicateChecker proposals={proposals} />
      
      {/* Date Filter */}
      <div className="flex justify-between items-center">
        <ProposalsDateFilter
          filterType={filterType}
          dateRange={customDateRange}
          onFilterChange={onFilterChange}
        />
      </div>
      
      {/* Summary Cards */}
      <ProposalsSummaryCards proposals={proposals} />
      
      {/* Proposals History */}
      <Card className="border-af-blue-200 shadow-md rounded-xl bg-white">
        <CardHeader className="border-b border-af-blue-100 bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold">Histórico de Propostas</CardTitle>
        </CardHeader>
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
  );
};

export default UploadTabContent;
