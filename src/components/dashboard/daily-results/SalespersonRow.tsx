
import React from 'react';
import { DailySalesperson } from './types';
import { formatCurrency } from '@/lib/utils';

export interface SalespersonRowProps {
  person: DailySalesperson;
}

const SalespersonRow = ({ person }: SalespersonRowProps) => {
  return (
    <tr className={`border-b border-gray-200 last:border-0 hover:bg-gray-50 text-xs`}>
      <td className="py-2 pl-4 pr-2 whitespace-nowrap">
        <div className="font-medium text-gray-900">{person.name}</div>
      </td>
      <td className="px-2 py-2 text-center">{person.salesCount || 0}</td>
      <td className="px-2 py-2 text-center">{person.goalsPercentage ? `${person.goalsPercentage}%` : '0%'}</td>
      <td className="px-2 py-2 text-right">
        {formatCurrency(person.salesAmount || 0)}
      </td>
      <td className="px-2 py-2 text-center">
        {person.proposalsCount || 0}
      </td>
      <td className="py-2 pl-2 pr-4 text-right">
        {formatCurrency(person.feesAmount || 0)}
      </td>
    </tr>
  );
};

export default SalespersonRow;
