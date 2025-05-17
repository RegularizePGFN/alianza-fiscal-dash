
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  error: string | null;
}

const ErrorAlert = ({ error }: ErrorAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro no processamento</AlertTitle>
      <AlertDescription>
        {error}. Você pode continuar com a entrada manual de dados.
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
