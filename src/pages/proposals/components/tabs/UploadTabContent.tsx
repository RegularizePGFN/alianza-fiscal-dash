
import { ExtractedData, Proposal } from "@/lib/types/proposals";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import ProposalHistory from "@/components/proposals/ProposalHistory";
import { Separator } from "@/components/ui/separator";

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
  setProcessingStatus
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
      
      <ProposalHistory
        proposals={proposals}
        isLoading={loadingProposals}
        onViewProposal={onViewProposal}
        onDeleteProposal={onDeleteProposal}
      />
    </div>
  );
};

export default UploadTabContent;
