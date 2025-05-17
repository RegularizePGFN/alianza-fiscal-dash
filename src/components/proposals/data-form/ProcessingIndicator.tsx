
import React from 'react';
import { Loader } from "lucide-react";

interface ProcessingIndicatorProps {
  processing: boolean;
}

const ProcessingIndicator = ({ processing }: ProcessingIndicatorProps) => {
  if (!processing) return null;

  return (
    <div className="flex justify-center items-center h-60">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-300 rounded-full animate-ping opacity-30"></div>
          <Loader className="animate-spin h-12 w-12 mx-auto text-purple-600 relative" />
        </div>
        <p className="text-lg font-medium text-purple-800">Processando dados com IA avançada</p>
        <p className="text-sm text-muted-foreground max-w-md">
          Nossa IA está analisando e estruturando os dados para você. Isso leva apenas alguns segundos...
        </p>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
