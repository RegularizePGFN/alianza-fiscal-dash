
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface CommentsSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
  };
}

const CommentsSection = ({ data, colors }: CommentsSectionProps) => {
  if (!data.additionalComments) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
          style={{ color: colors.secondary }}>
        Observações
      </h3>
      <div className="bg-gray-50 p-3 rounded border border-gray-100">
        <p className="text-sm whitespace-pre-line">{data.additionalComments}</p>
      </div>
    </div>
  );
};

export default CommentsSection;
