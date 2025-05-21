
import React from 'react';

interface CommentsSectionProps {
  comments: string;
}

const CommentsSection = ({ comments }: CommentsSectionProps) => {
  if (!comments) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200">
        Observações
      </h3>
      <div className="bg-gray-50 p-3 rounded border border-gray-100">
        <p className="text-sm whitespace-pre-line">{comments}</p>
      </div>
    </div>
  );
};

export default CommentsSection;
