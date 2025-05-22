
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface PageCalculatorProps {
  data: Partial<ExtractedData>;
}

/**
 * Calculates the total number of pages for a proposal
 */
const PageCalculator = ({ data }: PageCalculatorProps) => {
  // Calculate the total number of pages
  const totalPages = React.useMemo(() => {
    let pages = 1; // Start with the main page
    
    try {
      const entryDates = data.entryDates ? JSON.parse(data.entryDates) : [];
      const installmentDates = data.installmentDates ? JSON.parse(data.installmentDates) : [];
      
      // Add a page for payment schedule if needed
      if (entryDates.length > 0 || installmentDates.length > 0) {
        pages++;
      }
    } catch (error) {
      console.error('Error parsing payment dates:', error);
    }
    
    return pages;
  }, [data.entryDates, data.installmentDates]);

  return { totalPages };
};

export default PageCalculator;
