
import React from 'react';

interface FooterSectionProps {
  specialistName: string;
}

const FooterSection = ({ specialistName }: FooterSectionProps) => {
  return (
    <div className="text-center text-xs text-gray-400 mt-4">
      <p>Proposta gerada por {specialistName || 'Especialista Tributário'}</p>
    </div>
  );
};

export default FooterSection;
