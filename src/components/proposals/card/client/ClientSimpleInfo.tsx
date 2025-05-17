
import React from 'react';
import { Briefcase } from 'lucide-react';

interface ClientSimpleInfoProps {
  businessActivity?: string;
}

const ClientSimpleInfo = ({ businessActivity }: ClientSimpleInfoProps) => {
  if (!businessActivity) return null;
  
  return (
    <div className="bg-slate-50 border border-af-blue-100 p-4">
      <span className="font-medium text-af-blue-700 flex items-center">
        <Briefcase className="h-4 w-4 mr-2" />
        Ramo de Atividade:
      </span>
      <p className="text-base mt-1 pl-6">{businessActivity}</p>
    </div>
  );
};

export default ClientSimpleInfo;
