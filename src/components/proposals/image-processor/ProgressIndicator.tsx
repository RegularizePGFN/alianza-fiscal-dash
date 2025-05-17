
import React from 'react';
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  processing: boolean;
  progressPercent: number;
  processingStatus: string;
}

const ProgressIndicator = ({ processing, progressPercent, processingStatus }: ProgressIndicatorProps) => {
  if (!processing) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-amber-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{processingStatus}</span>
      </div>
      <Progress value={progressPercent} className="h-2" />
      <p className="text-xs text-gray-500 text-right">{Math.round(progressPercent)}%</p>
    </div>
  );
};

export default ProgressIndicator;
