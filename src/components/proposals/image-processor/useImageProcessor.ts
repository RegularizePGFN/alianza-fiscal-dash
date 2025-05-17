
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { ExtractedData } from '@/lib/types/proposals';
import { useAiProcessing } from './utils/aiProcessing';
import { useErrorHandler, getProcessingStatus } from './utils/errorHandling';
import { validateImageFile, fileToDataUrl } from './utils/imageUtils';

interface UseImageProcessorProps {
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProgressPercent: (percent: number) => void;
}

/**
 * Main hook for image processing functionality
 */
export const useImageProcessor = ({
  onProcessComplete,
  setProcessing,
  setProgressPercent
}: UseImageProcessorProps) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const { handleError, retryCount, setRetryCount } = useErrorHandler();
  const { processImageWithAI } = useAiProcessing();

  /**
   * Process the image with AI
   */
  const processWithAI = async (imageUrl: string) => {
    setProcessing(true);
    setProgressPercent(0);
    setProcessingStatus('Inicializando análise de IA...');
    setError(null);
    
    try {
      const extractedData = await processImageWithAI(
        imageUrl, 
        (progress) => {
          setProgressPercent(progress);
          setProcessingStatus(getProcessingStatus(progress));
        },
        setProcessingStatus
      );
      
      // Passa os dados extraídos e a prévia de volta para o componente pai
      onProcessComplete(extractedData, imageUrl);
      
      toast({
        title: "Processamento concluído",
        description: "Dados extraídos com sucesso usando IA avançada!",
      });
    } catch (error) {
      handleError(error, imageUrl, processWithAI, onProcessComplete);
      setError(error instanceof Error ? error.message : 'Erro desconhecido no processamento');
    } finally {
      setProcessing(false);
      setProgressPercent(100);
    }
  };

  /**
   * Handle file input change event
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file
      if (!validateImageFile(file)) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem JPG, JPEG ou PNG com tamanho máximo de 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Process the file
      fileToDataUrl(file)
        .then(imageUrl => {
          setImagePreview(imageUrl);
          setRetryCount(0);
          processWithAI(imageUrl);
        })
        .catch(err => {
          console.error("Error processing image:", err);
          toast({
            title: "Erro no processamento",
            description: "Não foi possível processar a imagem selecionada.",
            variant: "destructive",
          });
        });
    }
  };

  return {
    imagePreview,
    processingStatus,
    error,
    handleImageChange
  };
};
