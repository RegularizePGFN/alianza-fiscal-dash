
import React, { createContext, useContext, useState } from 'react';
import { SortConfig, SortColumn, SortDirection } from './types';

interface DailyResultsContextValue {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  sortBy: (column: SortColumn) => void;
  sortConfig: SortConfig;
}

const DailyResultsContext = createContext<DailyResultsContextValue | undefined>(undefined);

export const DailyResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'salesAmount',
    direction: 'desc',
  });

  const sortBy = (column: SortColumn) => {
    setSortConfig(prev => {
      if (prev.key === column) {
        return {
          key: column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        key: column,
        direction: 'desc',
      };
    });
  };

  const value = {
    sortColumn: sortConfig.key,
    sortDirection: sortConfig.direction,
    sortBy,
    sortConfig,
  };

  return (
    <DailyResultsContext.Provider value={value}>
      {children}
    </DailyResultsContext.Provider>
  );
};

export const useDailyResults = () => {
  const context = useContext(DailyResultsContext);
  if (context === undefined) {
    throw new Error('useDailyResults must be used within a DailyResultsProvider');
  }
  return context;
};
