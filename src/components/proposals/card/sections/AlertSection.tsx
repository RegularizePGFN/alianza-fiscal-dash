
import React from 'react';

const AlertSection = () => {
  return (
    <div className="mb-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
        <div>
          <h4 className="text-base font-semibold text-amber-800 mb-1">Consequências da Dívida Ativa</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
              <span>Protesto em Cartório - Negativação do CNPJ</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
              <span>Execução Fiscal - Cobrança judicial da dívida</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
              <span>Bloqueio de Contas e Bens - Sisbajud</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-1.5 flex-shrink-0"></div>
              <span>Impossibilidade de participação em licitações</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlertSection;
