
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Sale } from '@/lib/types';

export type SortDirection = 'asc' | 'desc';
export type SortColumn = 'name' | 'proposals' | 'fees' | 'salesCount' | 'salesAmount';

export interface DailyResultsContextValue {
  dailySales: Sale[];
  setDailySales: React.Dispatch<React.SetStateAction<Sale[]>>;
  currentDate: string;
  setCurrentDate: React.Dispatch<React.SetStateAction<string>>;
  sortColumn: SortColumn;
  setSortColumn: React.Dispatch<React.SetStateAction<SortColumn>>;
  sortDirection: SortDirection;
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
}

const DailyResultsContext = createContext<DailyResultsContextValue | undefined>(undefined);

export const DailyResultsProvider = ({ children }: { children: ReactNode }) => {
  const [dailySales, setDailySales] = useState<Sale[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesAmount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  return (
    <DailyResultsContext.Provider
      value={{
        dailySales,
        setDailySales,
        currentDate,
        setCurrentDate,
        sortColumn,
        setSortColumn,
        sortDirection,
        setSortDirection,
      }}
    >
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
