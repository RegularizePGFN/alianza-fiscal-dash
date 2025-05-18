
import React from 'react';
import { FileTextIcon, DollarSignIcon } from 'lucide-react';

export function TableHeader() {
  return (
    <thead className="bg-gray-100 text-[10px] uppercase tracking-wider text-gray-700">
      <tr>
        <th className="py-2 pl-4 pr-2 text-left">Vendedor</th>
        <th className="px-2 py-2 text-center">Vendas</th>
        <th className="px-2 py-2 text-center">Meta</th>
        <th className="px-2 py-2 text-right">Valor</th>
        <th className="px-2 py-2 text-center" title="Propostas Enviadas">
          <div className="flex items-center justify-center">
            <FileTextIcon className="h-3 w-3 mr-1" />
            <span>Prop.</span>
          </div>
        </th>
        <th className="py-2 pl-2 pr-4 text-right" title="Honorários">
          <div className="flex items-center justify-end">
            <DollarSignIcon className="h-3 w-3 mr-1" />
            <span>Honor.</span>
          </div>
        </th>
      </tr>
    </thead>
  );
}
