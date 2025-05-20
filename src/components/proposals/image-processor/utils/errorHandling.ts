
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import * as React from 'react';

/**
 * Creates error handling utilities for the image processor
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 2;

  const handleError = (
    error: unknown, 
    imageUrl: string, 
    processCallback: (url: string) => void,
    fallbackHandler: (defaults: any, url: string) => void
  ) => {
    sonnerToast.dismiss();
    console.error('Erro na extração por IA:', error);
    
    // Mensagens de erro mais descritivas
    let errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro desconhecido no processamento da imagem';
    
    // Adiciona sugestão em caso de erro
    if (errorMessage.includes('API da IA') || errorMessage.includes('OpenAI') || errorMessage.includes('configurada')) {
      errorMessage = `${errorMessage}. Verifique a chave da API configurada`;
      sonnerToast.error('É necessário configurar a chave da API da OpenAI');
    } else if (errorMessage.includes('imagem') || errorMessage.includes('format')) {
      errorMessage = `${errorMessage}. Tente com outra imagem mais clara`;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('demorou')) {
      errorMessage = `A análise da imagem demorou muito tempo. Tente novamente com uma imagem menor ou mais simples.`;
    }
    
    // Cria o botão de retry se estiver dentro do limite de tentativas
    let actionButton;
    if (retryCount < MAX_RETRIES) {
      const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        processCallback(imageUrl);
      };
      
      // Cria o elemento Button usando a API do React sem JSX
      actionButton = React.createElement(Button, {
        onClick: handleRetry,
        size: "sm",
        variant: "outline"
      }, "Tentar novamente");
    }
    
    toast({
      title: "Erro no processamento",
      description: "Não foi possível processar a imagem com IA. Por favor, insira os dados manualmente.",
      variant: "destructive",
      action: actionButton
    });
    
    // Ainda permite que o usuário continue com entrada manual
    fallbackHandler({
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
  };

  return {
    handleError,
    retryCount,
    setRetryCount
  };
};

import { useState } from 'react';

/**
 * Formats a more user-friendly processing status message based on progress
 */
export const getProcessingStatus = (progress: number): string => {
  if (progress < 30) {
    return 'Preparando imagem para análise...';
  } else if (progress < 60) {
    return 'Processando com IA avançada...';
  } else if (progress < 90) {
    return 'Extraindo dados estruturados...';
  } else {
    return 'Finalizando análise...';
  }
};

/**
 * Handle error message formatting for consistent error display
 */
export const handleErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido no processamento da imagem';
};
