import { ExtractedData } from '@/lib/types/proposals';
import UploadDropzone from './upload/UploadDropzone';
import AIProcessingPanel from './upload/AIProcessingPanel';
import { useImageProcessor } from './image-processor';

interface AIImageProcessorProps {
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  processing: boolean;
  setProcessing: (isProcessing: boolean) => void;
  progressPercent: number;
  setProgressPercent: (percent: number) => void;
  updateStatus: (status: string) => void;
}

const AIImageProcessor = ({
  onProcessComplete,
  processing,
  setProcessing,
  progressPercent,
  setProgressPercent,
  updateStatus,
}: AIImageProcessorProps) => {
  const { imagePreview, processingStatus, error, handleImageChange } = useImageProcessor({
    onProcessComplete,
    setProcessing,
    setProgressPercent,
    updateStatus,
  });

  return (
    <div className="space-y-5">
      <UploadDropzone
        onImageChange={handleImageChange}
        disabled={processing}
        hasImage={!!imagePreview}
      />
      <AIProcessingPanel
        processing={processing}
        progressPercent={progressPercent}
        status={processingStatus}
        error={error}
        imagePreview={imagePreview}
      />
    </div>
  );
};

export default AIImageProcessor;
