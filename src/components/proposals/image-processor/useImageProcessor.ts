
import { useState } from 'react';
import { analyzeImageWithAI } from '@/lib/services/vision';
import { ExtractedData } from '@/lib/types/proposals';
import { handleErrorMessage } from './utils/errorHandling';

interface UseImageProcessorProps {
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  setProcessing: (processing: boolean) => void;
  setProgressPercent: (percent: number) => void;
  updateStatus?: (status: string) => void;
}

export const useImageProcessor = ({
  onProcessComplete,
  setProcessing,
  setProgressPercent,
  updateStatus = () => {}
}: UseImageProcessorProps) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const updateProcessingStatus = (status: string) => {
    setProcessingStatus(status);
    if (updateStatus) {
      updateStatus(status);
    }
  };

  const handleImageChange = async (imageBase64: string) => {
    setImagePreview(imageBase64);
    setError(null);
    setProcessing(true);
    setProgressPercent(0);
    updateProcessingStatus('Iniciando processamento da imagem...');
    
    try {
      // Analyze with AI Vision
      const extractedData = await analyzeImageWithAI(
        imageBase64, 
        setProgressPercent,
        updateProcessingStatus
      );
      
      onProcessComplete(extractedData, imageBase64);
      updateProcessingStatus('Processamento concluído com sucesso!');
      
    } catch (err) {
      console.error('Erro no processamento da imagem:', err);
      const errorMsg = handleErrorMessage(err);
      setError(errorMsg);
      updateProcessingStatus('Erro no processamento');
    } finally {
      setProcessing(false);
    }
  };

  return {
    imagePreview,
    processingStatus,
    error,
    handleImageChange
  };
};
