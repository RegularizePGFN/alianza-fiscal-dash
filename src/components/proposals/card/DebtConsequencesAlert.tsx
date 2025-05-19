
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DebtConsequencesAlert = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
      <div className="flex items-start">
        <AlertTriangle className="text-amber-500 h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-amber-800 mb-1">Consequências da Dívida Ativa</h4>
          <ul className="text-xs text-amber-700 space-y-1">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 mr-1.5 flex-shrink-0"></div>
              <span>Protesto em Cartório - Negativação do CNPJ</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 mr-1.5 flex-shrink-0"></div>
              <span>Execução Fiscal - Cobrança judicial da dívida</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 mr-1.5 flex-shrink-0"></div>
              <span>Bloqueio de Contas e Bens - Sisbajud</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 mr-1.5 flex-shrink-0"></div>
              <span>Impossibilidade de participação em licitações</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebtConsequencesAlert;
