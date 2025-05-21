
import React, { createContext, useContext, useState } from 'react';
import { SortColumn, SortDirection } from './types';

interface DailyResultsContextType {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  setSortColumn: (column: SortColumn) => void;
  setSortDirection: (direction: SortDirection) => void;
}

const DailyResultsContext = createContext<DailyResultsContextType | undefined>(undefined);

export const DailyResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesAmount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  return (
    <DailyResultsContext.Provider value={{ 
      sortColumn, 
      sortDirection, 
      setSortColumn, 
      setSortDirection 
    }}>
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
