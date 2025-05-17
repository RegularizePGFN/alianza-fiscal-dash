
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ExtractedData } from '@/lib/types/proposals';
import { fetchCnpjData } from '@/lib/api';
import { analyzeImageWithAI } from '@/lib/services/vision';

interface UseImageProcessorProps {
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProgressPercent: (percent: number) => void;
}

export const useImageProcessor = ({
  onProcessComplete,
  setProcessing,
  setProgressPercent
}: UseImageProcessorProps) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const processWithAI = async (imageUrl: string) => {
    setProcessing(true);
    setProgressPercent(0);
    setProcessingStatus('Inicializando análise de IA...');
    setError(null);
    
    try {
      // Analisa a imagem usando o modelo de visão da OpenAI
      setProcessingStatus('Analisando imagem com IA...');
      const extractedData = await analyzeImageWithAI(imageUrl, (progress) => {
        setProgressPercent(progress);
        
        if (progress < 30) {
          setProcessingStatus('Preparando imagem para análise...');
        } else if (progress < 60) {
          setProcessingStatus('Processando com IA avançada...');
        } else if (progress < 90) {
          setProcessingStatus('Extraindo dados estruturados...');
        } else {
          setProcessingStatus('Finalizando análise...');
        }
      });
      
      console.log('Dados extraídos da imagem:', extractedData);
      
      // Automaticamente busca dados do CNPJ se disponível
      if (extractedData.cnpj) {
        try {
          setProcessingStatus('Buscando dados do CNPJ...');
          const cnpjData = await fetchCnpjData(extractedData.cnpj);
          
          if (cnpjData) {
            // Atualiza campos apenas se não foram extraídos da imagem
            if (!extractedData.clientName && cnpjData.company?.name) {
              extractedData.clientName = cnpjData.company.name;
            }
            
            if (!extractedData.clientEmail && cnpjData.emails && cnpjData.emails.length > 0) {
              extractedData.clientEmail = cnpjData.emails[0].address;
            }
            
            if (!extractedData.clientPhone && cnpjData.phones && cnpjData.phones.length > 0) {
              const phone = cnpjData.phones[0];
              extractedData.clientPhone = `${phone.area}${phone.number}`;
            }
            
            if (!extractedData.businessActivity) {
              if (cnpjData.sideActivities && cnpjData.sideActivities.length > 0) {
                const activity = cnpjData.sideActivities[0];
                extractedData.businessActivity = `${activity.id} | ${activity.text}`;
              } else if (cnpjData.mainActivity) {
                extractedData.businessActivity = `${cnpjData.mainActivity.id} | ${cnpjData.mainActivity.text}`;
              }
            }

            toast({
              title: "Dados da Empresa",
              description: "Informações do CNPJ foram adicionadas automaticamente!",
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do CNPJ:', error);
          // Continua sem dados do CNPJ se houver um erro
        }
      }
      
      // Se não conseguirmos extrair alguns campos obrigatórios, use valores padrão
      if (!extractedData.totalDebt || !extractedData.discountedValue) {
        // Preenche com valores padrão para fins de demonstração
        if (!extractedData.totalDebt) extractedData.totalDebt = "0,00";
        if (!extractedData.discountedValue) extractedData.discountedValue = "0,00";
        if (!extractedData.discountPercentage) extractedData.discountPercentage = "0,00";
        if (!extractedData.installments) extractedData.installments = "0";
        if (!extractedData.installmentValue) extractedData.installmentValue = "0,00";
        if (!extractedData.entryValue) extractedData.entryValue = "0,00";
        if (!extractedData.entryInstallments) extractedData.entryInstallments = "1";
        if (!extractedData.feesValue) extractedData.feesValue = "0,00";
        
        toast({
          title: "Extração parcial",
          description: "Alguns campos não foram reconhecidos. Por favor, verifique e complete os dados.",
          variant: "destructive",
        });
      }
      
      // Passa os dados extraídos e a prévia de volta para o componente pai
      onProcessComplete(extractedData, imageUrl);
      
      toast({
        title: "Processamento concluído",
        description: "Dados extraídos com sucesso usando IA avançada!",
      });
    } catch (error) {
      console.error('Erro na extração por IA:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido no processamento da imagem');
      
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar a imagem com IA. Por favor, insira os dados manualmente.",
        variant: "destructive",
      });
      
      // Ainda permite que o usuário continue com entrada manual
      onProcessComplete({
        // Fornece valores padrão vazios
        totalDebt: "0,00",
        discountedValue: "0,00",
        discountPercentage: "0,00",
        installments: "0",
        installmentValue: "0,00",
        entryValue: "0,00",
        entryInstallments: "1",
        feesValue: "0,00"
      }, imageUrl);
    } finally {
      setProcessing(false);
      setProgressPercent(100);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Cria uma URL de prévia
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        
        // Processa com IA
        processWithAI(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return {
    imagePreview,
    processingStatus,
    error,
    handleImageChange
  };
};
