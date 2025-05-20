
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CompanyData } from '@/lib/types/proposals';

interface CompanyDataContextType {
  companyData: CompanyData | null;
  setCompanyData: (data: CompanyData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const defaultContext: CompanyDataContextType = {
  companyData: null,
  setCompanyData: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {}
};

const CompanyDataContext = createContext<CompanyDataContextType>(defaultContext);

export const useCompanyData = () => useContext(CompanyDataContext);

interface CompanyDataProviderProps {
  children: ReactNode;
}

export const CompanyDataProvider: React.FC<CompanyDataProviderProps> = ({ children }) => {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <CompanyDataContext.Provider 
      value={{ 
        companyData, 
        setCompanyData, 
        isLoading, 
        setIsLoading, 
        error, 
        setError 
      }}
    >
      {children}
    </CompanyDataContext.Provider>
  );
};

export default CompanyDataProvider;
