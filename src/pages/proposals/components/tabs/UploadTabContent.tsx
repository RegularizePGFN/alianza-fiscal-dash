import { ExtractedData, Proposal } from "@/lib/types/proposals";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import ProposalHistory from "@/components/proposals/ProposalHistory";
import { ProposalsSummaryCards } from "@/components/proposals/ProposalsSummaryCards";
import { ProposalsDateFilter, DateFilterType, DateRange } from "@/components/proposals/ProposalsDateFilter";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";

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
  onFilterChange,
}: UploadTabContentProps) => {
  return (
    <div className="space-y-8">
      {/* Upload + IA */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <AIImageProcessor
            onProcessComplete={onProcessComplete}
            processing={processing}
            setProcessing={setProcessing}
            progressPercent={progressPercent}
            setProgressPercent={setProgressPercent}
            updateStatus={setProcessingStatus}
          />
        </CardContent>
      </Card>

      {/* Histórico */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Histórico de propostas</h2>
              <p className="text-xs text-muted-foreground">Filtre por período e acesse propostas anteriores</p>
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

export default UploadTabContent;
