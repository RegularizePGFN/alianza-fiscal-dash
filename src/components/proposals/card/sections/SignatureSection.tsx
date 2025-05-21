
import React from 'react';

interface SignatureSectionProps {
  specialistName: string;
}

const SignatureSection = ({ specialistName }: SignatureSectionProps) => {
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex flex-col items-center">
        <div className="w-48 border-b border-gray-300 pb-1 mb-2"></div>
        <p className="text-sm font-medium text-gray-700">
          {specialistName || 'Nome do Especialista'}
        </p>
        <p className="text-sm text-gray-500">Especialista Tributário</p>
      </div>
    </div>
  );
};

export default SignatureSection;
