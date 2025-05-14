
import { createContext, useContext, useState } from "react";
import { SortColumn, SortDirection, DailyResultsContextType } from "./types";

const DailyResultsContext = createContext<DailyResultsContextType | undefined>(undefined);

export const DailyResultsProvider = ({ children }: { children: React.ReactNode }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('salesAmount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const handleSort = (column: SortColumn) => {
    // If clicking the same column, toggle direction
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new column, set it as the sort column and default to descending
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  return (
    <DailyResultsContext.Provider value={{ sortColumn, sortDirection, handleSort }}>
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
