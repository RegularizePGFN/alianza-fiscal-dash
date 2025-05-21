
import React from 'react';

interface SignatureSectionProps {
  specialistName: string;
}

const SignatureSection = ({ specialistName }: SignatureSectionProps) => {
  return (
    <div className="text-center mt-8 space-y-4">
      <div className="border-t border-gray-300 w-48 mx-auto pt-2">
        <p className="font-medium">{specialistName || 'Nome do Especialista'}</p>
        <p className="text-sm text-gray-500">Especialista Tributário</p>
      </div>
    </div>
  );
};

export default SignatureSection;
