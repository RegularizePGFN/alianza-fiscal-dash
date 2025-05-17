
import { analyzeImageWithAI } from '@/lib/services/vision';
import { ExtractedData } from '@/lib/types/proposals';
import { fetchCnpjData } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

/**
 * Hook for handling the AI analysis process
 */
export const useAiProcessing = () => {
  const { toast } = useToast();

  /**
   * Process image with AI and augment with CNPJ data when available
   */
  const processImageWithAI = async (
    imageUrl: string,
    updateProgress: (progress: number) => void,
    updateStatus: (status: string) => void
  ): Promise<Partial<ExtractedData>> => {
    sonnerToast.loading('Verificando configurações e preparando análise...');
    
    // Analisa a imagem usando o modelo de visão da OpenAI via Edge Function
    updateStatus('Enviando imagem para GPT-4o via Supabase...');
    const extractedData = await analyzeImageWithAI(imageUrl, (progress) => {
      updateProgress(progress);
    }, updateStatus);
    
    sonnerToast.dismiss();
    console.log('Dados extraídos da imagem:', extractedData);
    
    // Automaticamente busca dados do CNPJ se disponível
    if (extractedData.cnpj) {
      try {
        updateStatus('Buscando dados do CNPJ...');
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
    
    // Preenche com valores padrão campos obrigatórios que não foram extraídos
    if (!extractedData.totalDebt || !extractedData.discountedValue) {
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
    
    return extractedData;
  };

  return { processImageWithAI };
};
