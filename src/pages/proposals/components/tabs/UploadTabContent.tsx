
import { ExtractedData, Proposal } from "@/lib/types/proposals";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import ProposalHistory from "@/components/proposals/ProposalHistory";
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
      
      <Card className="border-af-blue-200 shadow-md rounded-xl bg-white">
        <CardHeader className="border-b border-af-blue-100 bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold">Histórico de Propostas</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ProposalHistory
            proposals={proposals}
            isLoading={loadingProposals}
            onViewProposal={onViewProposal}
            onDeleteProposal={onDeleteProposal}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadTabContent;
