
import React from 'react';
import { DailySalesperson, SortConfig } from './types';
import { formatCurrency } from '@/lib/utils';

export interface SalespersonRowProps {
  person: DailySalesperson;
  key?: string;
}

const SalespersonRow: React.FC<SalespersonRowProps> = ({ person }) => {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2 pl-4">{person.name}</td>
      <td className="p-2 text-center">{person.salesCount}</td>
      <td className="p-2 text-center">{formatCurrency(person.salesAmount)}</td>
      <td className="p-2 text-center">{person.proposalsCount || 0}</td>
      <td className="p-2 pr-4 text-center">
        {formatCurrency(person.feesAmount || 0)}
      </td>
    </tr>
  );
};

export default SalespersonRow;
