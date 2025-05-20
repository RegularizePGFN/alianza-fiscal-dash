
import * as React from 'react';
import { useState } from 'react';

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
