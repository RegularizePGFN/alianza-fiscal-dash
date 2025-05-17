
import React from 'react';
import { Loader2 } from "lucide-react";

interface ProcessingIndicatorProps {
  processing: boolean;
}

const ProcessingIndicator = ({ processing }: ProcessingIndicatorProps) => {
  if (!processing) return null;

  return (
    <div className="flex justify-center items-center h-40">
      <div className="text-center">
        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Processando dados com IA...</p>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
