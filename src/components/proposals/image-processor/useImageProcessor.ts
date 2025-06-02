
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
    console.log('Status atualizado:', status);
    setProcessingStatus(status);
    updateStatus(status);
  };

  // This function now handles file input events directly
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageChange chamado');
    
    if (!e.target.files || e.target.files.length === 0) {
      console.log('Nenhum arquivo selecionado');
      return;
    }
    
    const file = e.target.files[0];
    console.log('Arquivo selecionado:', file.name, file.type, file.size);
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target || typeof event.target.result !== 'string') {
        console.error('Erro ao ler arquivo');
        return;
      }
      
      const imageBase64 = event.target.result;
      console.log('Imagem convertida para base64, tamanho:', imageBase64.length);
      
      setImagePreview(imageBase64);
      setError(null);
      setProcessing(true);
      setProgressPercent(0);
      updateProcessingStatus('Iniciando processamento da imagem...');
      
      try {
        console.log('Iniciando análise com IA...');
        
        // Analyze with AI Vision
        const extractedData = await analyzeImageWithAI(
          imageBase64, 
          (progress) => {
            console.log('Progresso:', progress);
            setProgressPercent(progress);
          },
          (status) => {
            console.log('Status da análise:', status);
            updateProcessingStatus(status);
          }
        );
        
        console.log('Dados extraídos com sucesso:', extractedData);
        
        // Ensure we have some extracted data before calling onProcessComplete
        if (extractedData && Object.keys(extractedData).length > 0) {
          console.log('Chamando onProcessComplete com dados extraídos');
          onProcessComplete(extractedData, imageBase64);
          updateProcessingStatus('Processamento concluído com sucesso!');
        } else {
          console.warn('Nenhum dado foi extraído da imagem');
          setError('Não foi possível extrair dados da imagem. Verifique se é uma simulação PGFN válida.');
          updateProcessingStatus('Erro: Nenhum dado extraído');
        }
        
      } catch (err) {
        console.error('Erro no processamento da imagem:', err);
        const errorMsg = handleErrorMessage(err);
        setError(errorMsg);
        updateProcessingStatus('Erro no processamento');
      } finally {
        setProcessing(false);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Erro ao ler arquivo:', error);
      setError('Erro ao ler o arquivo de imagem');
      setProcessing(false);
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
