
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
  updateStatus: (status: string) => void;
}

const AIImageProcessor = ({
  onProcessComplete,
  processing,
  setProcessing,
  progressPercent,
  setProgressPercent,
  updateStatus
}: AIImageProcessorProps) => {
  console.log('AIImageProcessor renderizado com processing:', processing);
  
  const {
    imagePreview,
    processingStatus,
    error,
    handleImageChange
  } = useImageProcessor({
    onProcessComplete,
    setProcessing,
    setProgressPercent,
    updateStatus
  });

  console.log('AIImageProcessor estado:', { 
    processing, 
    progressPercent, 
    processingStatus, 
    imagePreview: !!imagePreview,
    error 
  });

  return (
    <Card className="border-purple-200 overflow-hidden shadow-md bg-white dark:bg-gray-800 dark:border-purple-900">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-700 text-white border-b border-purple-700 dark:border-purple-900">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <span className="bg-white/20 p-1 rounded">AI</span>
          Análise de Imagem com Inteligência Artificial
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 dark:bg-gray-800">
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
