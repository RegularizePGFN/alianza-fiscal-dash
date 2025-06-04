
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

  // This function now handles file input events directly
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target || typeof event.target.result !== 'string') {
        return;
      }
      
      const imageBase64 = event.target.result;
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
    
    reader.readAsDataURL(file);
  };

  return {
    imagePreview,
    processingStatus,
    error,
    handleImageChange
  };
};
