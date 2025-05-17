
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DebtConsequencesAlert = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 p-3">
      <div className="flex items-center mb-1.5">
        <AlertTriangle className="text-amber-500 h-4 w-4 mr-2 flex-shrink-0" />
        <h3 className="font-semibold text-amber-800 text-sm">Consequências da Dívida Ativa</h3>
      </div>
      <p className="text-xs text-amber-700 mb-2">
        Negociar sua dívida ativa evita complicações jurídicas e financeiras sérias:
      </p>
      
      <div className="space-y-1.5 text-xs pl-1.5">
        <div className="flex items-start">
          <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 mr-1.5 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-amber-800">Protesto em Cartório</p>
            <p className="text-amber-700">
              CNPJ negativado, dificultando crédito e participação em licitações.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 mr-1.5 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-amber-800">Execução Fiscal</p>
            <p className="text-amber-700">
              A PGFN pode cobrar judicialmente a dívida, com risco de penhora.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 mr-1.5 flex-shrink-0"></div>
          <div>
            <p className="font-medium text-amber-800">Bloqueio de Contas e Bens</p>
            <p className="text-amber-700">
              Justiça pode bloquear valores bancários e bens (via Sisbajud).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtConsequencesAlert;
