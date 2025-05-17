
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  error: string | null;
}

const ErrorAlert = ({ error }: ErrorAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-red-800 font-medium">Erro na Análise com IA</AlertTitle>
      <AlertDescription className="text-red-700">
        {error}. Você pode continuar com a entrada manual de dados.
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
