
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtractedData } from '@/lib/types/proposals';
import { 
  FileUpload,
  ImagePreview,
  ProgressIndicator,
  ErrorAlert,
  useImageProcessor
} from './image-processor';

interface AIImageProcessorProps {
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  processing: boolean;
  setProcessing: (isProcessing: boolean) => void;
  progressPercent: number;
  setProgressPercent: (percent: number) => void;
}

const AIImageProcessor = ({
  onProcessComplete,
  processing,
  setProcessing,
  progressPercent,
  setProgressPercent
}: AIImageProcessorProps) => {
  const {
    imagePreview,
    processingStatus,
    error,
    handleImageChange
  } = useImageProcessor({
    onProcessComplete,
    setProcessing,
    setProgressPercent
  });

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Upload de Imagem PGFN</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <FileUpload 
            onImageChange={handleImageChange} 
            disabled={processing} 
          />
          
          <ErrorAlert error={error} />
          
          <ProgressIndicator 
            processing={processing}
            progressPercent={progressPercent}
            processingStatus={processingStatus}
          />
          
          <ImagePreview 
            imagePreview={imagePreview}
            processing={processing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AIImageProcessor;
