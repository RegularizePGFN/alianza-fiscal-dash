
import { useState } from 'react';
import { analyzeImageWithAI } from '@/lib/services/vision';
import { ExtractedData } from '@/lib/types/proposals';
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

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
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 2;
  
  const updateProcessingStatus = (status: string) => {
    console.log('📊 [IMAGE-PROCESSOR] Status:', status);
    setProcessingStatus(status);
    if (updateStatus) {
      updateStatus(status);
    }
  };

  const handleRetry = async (imageBase64: string) => {
    console.log(`🔄 [IMAGE-PROCESSOR] Tentativa ${retryCount + 1} de ${MAX_RETRIES + 1}`);
    setRetryCount(prev => prev + 1);
    setError(null);
    await processImage(imageBase64);
  };

  const processImage = async (imageBase64: string) => {
    console.log('🚀 [IMAGE-PROCESSOR] Iniciando processamento da imagem...');
    setError(null);
    setProcessing(true);
    setProgressPercent(0);
    updateProcessingStatus('Preparando imagem para análise...');
    
    try {
      // Analyze with AI Vision
      console.log('🔍 [IMAGE-PROCESSOR] Chamando analyzeImageWithAI...');
      const extractedData = await analyzeImageWithAI(
        imageBase64, 
        (progress) => {
          console.log(`📈 [IMAGE-PROCESSOR] Progresso: ${progress}%`);
          setProgressPercent(progress);
        },
        updateProcessingStatus
      );
      
      console.log('✅ [IMAGE-PROCESSOR] Dados extraídos com sucesso:', extractedData);
      onProcessComplete(extractedData, imageBase64);
      updateProcessingStatus('Processamento concluído com sucesso!');
      setRetryCount(0); // Reset retry count on success
      
      sonnerToast.success('Imagem processada com sucesso!', {
        description: 'Os dados foram extraídos e preenchidos automaticamente.'
      });
      
    } catch (err: any) {
      console.error('💥 [IMAGE-PROCESSOR] Erro no processamento:', err);
      
      const errorCode = err.code || 'UNKNOWN_ERROR';
      const errorMessage = err.message || 'Erro desconhecido no processamento da imagem';
      
      console.log('🔍 [IMAGE-PROCESSOR] Código do erro:', errorCode);
      console.log('📝 [IMAGE-PROCESSOR] Mensagem do erro:', errorMessage);
      
      // Tratamento específico por tipo de erro
      let userFriendlyMessage = errorMessage;
      let canRetry = retryCount < MAX_RETRIES;
      
      switch (errorCode) {
        case 'API_KEY_MISSING':
          userFriendlyMessage = 'Configuração da API da OpenAI não encontrada. Entre em contato com o suporte.';
          canRetry = false;
          break;
        case 'TIMEOUT':
          userFriendlyMessage = 'A análise demorou muito tempo. Tente com uma imagem menor.';
          break;
        case 'NO_IMAGE':
          userFriendlyMessage = 'Nenhuma imagem foi detectada. Por favor, selecione uma imagem válida.';
          canRetry = false;
          break;
        case 'INVALID_CONTENT':
          userFriendlyMessage = 'A imagem não parece ser uma simulação PGFN válida. Verifique se a imagem está clara e contém os dados corretos.';
          break;
        case 'CONNECTION_ERROR':
          userFriendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          break;
        case 'NO_JSON_EXTRACTED':
        case 'INVALID_EXTRACTED_JSON':
          userFriendlyMessage = 'A IA não conseguiu interpretar a imagem. Tente com uma imagem mais clara ou de melhor qualidade.';
          break;
        default:
          if (errorMessage.includes('API da IA') || errorMessage.includes('OpenAI')) {
            userFriendlyMessage = 'Erro na comunicação com a IA. Tente novamente em alguns instantes.';
          }
      }
      
      setError(userFriendlyMessage);
      updateProcessingStatus('Erro no processamento');
      
      // Mostrar toast com opção de retry se aplicável
      if (canRetry) {
        toast({
          title: "Erro no processamento",
          description: userFriendlyMessage,
          variant: "destructive",
          action: (
            <button
              onClick={() => handleRetry(imageBase64)}
              className="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
            >
              Tentar novamente
            </button>
          )
        });
      } else {
        toast({
          title: "Erro no processamento",
          description: userFriendlyMessage,
          variant: "destructive",
        });
      }
      
      sonnerToast.error('Erro no processamento da imagem', {
        description: userFriendlyMessage
      });
      
    } finally {
      setProcessing(false);
      console.log('🏁 [IMAGE-PROCESSOR] Processamento finalizado');
    }
  };

  // This function now handles file input events directly
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 [IMAGE-PROCESSOR] Arquivo selecionado');
    
    if (!e.target.files || e.target.files.length === 0) {
      console.log('❌ [IMAGE-PROCESSOR] Nenhum arquivo selecionado');
      return;
    }
    
    const file = e.target.files[0];
    console.log('📄 [IMAGE-PROCESSOR] Arquivo:', file.name, 'Tamanho:', file.size, 'bytes');
    
    // Verificar tamanho do arquivo (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'Arquivo muito grande. O tamanho máximo é 10MB.';
      setError(errorMsg);
      toast({
        title: "Arquivo muito grande",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    // Verificar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Por favor, selecione apenas arquivos de imagem.';
      setError(errorMsg);
      toast({
        title: "Tipo de arquivo inválido",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target || typeof event.target.result !== 'string') {
        console.error('❌ [IMAGE-PROCESSOR] Erro ao ler arquivo');
        return;
      }
      
      const imageBase64 = event.target.result;
      console.log('🖼️ [IMAGE-PROCESSOR] Imagem convertida para base64');
      setImagePreview(imageBase64);
      setRetryCount(0); // Reset retry count for new image
      
      await processImage(imageBase64);
    };
    
    reader.onerror = () => {
      console.error('❌ [IMAGE-PROCESSOR] Erro ao ler arquivo');
      const errorMsg = 'Erro ao ler o arquivo da imagem.';
      setError(errorMsg);
      toast({
        title: "Erro ao ler arquivo",
        description: errorMsg,
        variant: "destructive",
      });
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
