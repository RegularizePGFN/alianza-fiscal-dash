
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  error: string | null;
  onRetry?: () => void;
}

const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 animate-in fade-in duration-300">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-red-800 font-medium">Erro na Análise com IA</AlertTitle>
      <AlertDescription className="text-red-700">
        {error}. Você pode continuar com a entrada manual de dados.
      </AlertDescription>
      <div className="flex gap-2 mt-2">
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="bg-white hover:bg-red-50 border-red-200"
          >
            Tentar novamente
          </Button>
        )}
        <button 
          className="absolute top-2 right-2 text-red-500 hover:text-red-700" 
          onClick={(e) => {
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
          }}
        >
          <span className="text-xl">&times;</span>
        </button>
      </div>
    </Alert>
  );
};

export default ErrorAlert;
