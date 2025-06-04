
import React from 'react';
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  error: string | null;
  onRetry?: () => void;
  canRetry?: boolean;
}

const ErrorAlert = ({ error, onRetry, canRetry = false }: ErrorAlertProps) => {
  if (!error) return null;
  
  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    const alertElement = e.currentTarget.closest('[role="alert"]');
    if (alertElement) {
      alertElement.classList.add('animate-out', 'fade-out', 'duration-300');
      setTimeout(() => {
        if (alertElement.parentElement) {
          alertElement.parentElement.removeChild(alertElement);
        }
      }, 300);
    }
  };
  
  return (
    <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 animate-in fade-in duration-300 dark:bg-red-950/50 dark:border-red-800">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-red-800 font-medium dark:text-red-300">
        Erro na Análise com IA
      </AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-200">
        <div className="mb-3">{error}</div>
        
        <div className="flex gap-2 mt-3">
          {canRetry && onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-200 dark:border-red-600 dark:hover:bg-red-900"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          )}
          
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100"
          >
            Fechar
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-red-600 dark:text-red-300">
          💡 <strong>Dica:</strong> Você pode continuar preenchendo os dados manualmente abaixo.
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
