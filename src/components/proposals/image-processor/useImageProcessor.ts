
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ExtractedData } from '@/lib/types/proposals';
import { extractDataFromImage } from '@/lib/services/ocr';
import { fetchCnpjData } from '@/lib/api';

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

  const processWithOCR = async (imageUrl: string) => {
    setProcessing(true);
    setProgressPercent(0);
    setProcessingStatus('Inicializando OCR...');
    setError(null);
    
    try {
      // Extract data using OCR
      setProcessingStatus('Analisando imagem com OCR...');
      const extractedData = await extractDataFromImage(imageUrl, (progress) => {
        setProgressPercent(progress);
        
        if (progress < 30) {
          setProcessingStatus('Preparando imagem...');
        } else if (progress < 60) {
          setProcessingStatus('Reconhecendo texto...');
        } else if (progress < 90) {
          setProcessingStatus('Extraindo dados...');
        } else {
          setProcessingStatus('Finalizando...');
        }
      });
      
      console.log('Dados extraídos da imagem:', extractedData);
      
      // Automatically fetch CNPJ data if available
      if (extractedData.cnpj) {
        try {
          setProcessingStatus('Buscando dados do CNPJ...');
          const cnpjData = await fetchCnpjData(extractedData.cnpj);
          
          if (cnpjData) {
            // Only update fields if they were not extracted from the image
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
          // Continue without CNPJ data if there's an error
        }
      }
      
      // If we couldn't extract some required fields, use fallbacks
      if (!extractedData.totalDebt || !extractedData.discountedValue) {
        // Fill in reasonable fallback values for demo purposes
        if (!extractedData.totalDebt) extractedData.totalDebt = "10.000,00";
        if (!extractedData.discountedValue) extractedData.discountedValue = "8.000,00";
        if (!extractedData.discountPercentage) extractedData.discountPercentage = "20,00";
        if (!extractedData.installments) extractedData.installments = "60";
        if (!extractedData.installmentValue) extractedData.installmentValue = "133,33";
        if (!extractedData.entryValue) extractedData.entryValue = "800,00";
        if (!extractedData.entryInstallments) extractedData.entryInstallments = "1";
        if (!extractedData.feesValue) extractedData.feesValue = "800,00";
        
        toast({
          title: "Extração parcial",
          description: "Alguns campos não foram reconhecidos. Valores aproximados foram inseridos.",
          variant: "destructive",
        });
      }
      
      // Pass the extracted data and preview back to the parent component
      onProcessComplete(extractedData, imageUrl);
      
      toast({
        title: "Processamento concluído",
        description: "Dados extraídos com sucesso! Verifique e ajuste conforme necessário.",
      });
    } catch (error) {
      console.error('Erro na extração por IA:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido no processamento da imagem');
      
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar a imagem. Por favor, insira os dados manualmente.",
        variant: "destructive",
      });
      
      // Still allow the user to proceed with manual entry
      onProcessComplete({
        // Provide empty default values
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
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        
        // Process with OCR
        processWithOCR(imageUrl);
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
