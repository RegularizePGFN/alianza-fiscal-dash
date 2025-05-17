
import React from 'react';
import { Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  processing: boolean;
  progressPercent: number;
  processingStatus: string;
}

const ProgressIndicator = ({ processing, progressPercent, processingStatus }: ProgressIndicatorProps) => {
  if (!processing) return null;
  
  return (
    <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-30"></div>
          <Loader className="h-5 w-5 animate-spin text-purple-600 relative" />
        </div>
        <span className="font-medium text-purple-800">{processingStatus}</span>
      </div>
      
      <Progress 
        value={progressPercent} 
        className="h-2 bg-purple-100" 
        indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
      />
      
      <div className="flex justify-between text-xs">
        <span className="text-purple-700">Analisando com IA</span>
        <span className="font-medium text-purple-800">{Math.round(progressPercent)}%</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
