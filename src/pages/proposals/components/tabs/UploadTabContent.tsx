
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import ProposalHistory from "@/components/proposals/ProposalHistory";
import { Proposal } from "@/lib/types/proposals";
import { motion } from "framer-motion";

interface UploadTabContentProps {
  imagePreview: string | null;
  processing: boolean;
  progressPercent: number;
  companyData: any;
  proposals: Proposal[];
  loadingProposals: boolean;
  onProcessComplete: (data: any, preview: string) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
  setProcessingStatus: (status: string) => void;
  setProcessing: (processing: boolean) => void;
  setProgressPercent: (percent: number) => void;
}

const UploadTabContent = ({
  imagePreview,
  processing,
  progressPercent,
  companyData,
  proposals,
  loadingProposals,
  onProcessComplete,
  onDeleteProposal,
  setProcessingStatus,
  setProcessing,
  setProgressPercent,
}: UploadTabContentProps) => {
  console.log('UploadTabContent - processing:', processing, 'progressPercent:', progressPercent);
  
  return (
    <div className="w-full max-w-none space-y-6">
      {/* Upload Section - Full Width */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-full"
      >
        <AIImageProcessor
          onProcessComplete={onProcessComplete}
          processing={processing}
          setProcessing={setProcessing}
          progressPercent={progressPercent}
          setProgressPercent={setProgressPercent}
          updateStatus={setProcessingStatus}
        />
      </motion.div>

      {/* Proposal History - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full"
      >
        <ProposalHistory
          proposals={proposals}
          loading={loadingProposals}
          onDeleteProposal={onDeleteProposal}
        />
      </motion.div>
    </div>
  );
};

export default UploadTabContent;
