import { ExtractedData } from "@/lib/types/proposals";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import { Card, CardContent } from "@/components/ui/card";

interface UploadTabContentProps {
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  progressPercent: number;
  setProgressPercent: (percent: number) => void;
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  setProcessingStatus: (status: string) => void;
}

const UploadTabContent = ({
  processing,
  setProcessing,
  progressPercent,
  setProgressPercent,
  onProcessComplete,
  setProcessingStatus,
}: UploadTabContentProps) => {
  return (
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
  );
};

export default UploadTabContent;
