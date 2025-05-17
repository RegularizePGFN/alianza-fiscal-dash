
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DebtConsequencesAlert = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 p-4">
      <div className="flex items-center mb-2">
        <AlertTriangle className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0" />
        <h3 className="font-semibold text-amber-800">Consequências da Dívida Ativa</h3>
      </div>
      <p className="text-sm text-amber-700 mb-3">
        Negociar sua dívida ativa evita complicações jurídicas e financeiras sérias. Ao deixar um débito sem regularização, sua empresa pode sofrer as seguintes penalidades:
      </p>
      
      <div className="space-y-2 text-sm pl-2">
        <div className="flex items-start">
          <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 mr-2 flex-shrink-0 inline-block"></span>
          <div>
            <p className="font-medium text-amber-800">Protesto em Cartório</p>
            <p className="text-amber-700 text-sm">
              O CNPJ é negativado, dificultando crédito, financiamentos e participação em licitações.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 mr-2 flex-shrink-0 inline-block"></span>
          <div>
            <p className="font-medium text-amber-800">Execução Fiscal</p>
            <p className="text-amber-700 text-sm">
              A PGFN pode cobrar judicialmente a dívida, com acréscimos legais e risco de penhora.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 mr-2 flex-shrink-0 inline-block"></span>
          <div>
            <p className="font-medium text-amber-800">Bloqueio de Contas e Bens</p>
            <p className="text-amber-700 text-sm">
              A Justiça pode bloquear valores bancários e bens em nome do devedor (via Sisbajud).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtConsequencesAlert;
