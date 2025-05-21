
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import ProposalContent from './ProposalContent';
import { HeaderSection } from './sections';

interface PaginatedProposalViewProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  onPrint?: () => void;
  className?: string;
}

const PaginatedProposalView: React.FC<PaginatedProposalViewProps> = ({ 
  data, 
  companyData,
  onPrint,
  className = ""
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Get colors from template settings or use defaults
  const colors = (() => {
    try {
      return {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      };
    } catch (e) {
      return {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      };
    }
  })();

  // Function to calculate total pages
  const calculateTotalPages = () => {
    // Count the number of .proposal-page elements
    const pageElements = document.querySelectorAll('.proposal-page');
    setTotalPages(pageElements.length || 1);
    
    // Update our refs array to match the number of pages
    pageRefs.current = Array(pageElements.length).fill(null);
  };

  useEffect(() => {
    // Calculate total pages after initial render and whenever data changes
    setTimeout(calculateTotalPages, 100);
    
    // Add resize listener to recalculate pages if window size changes
    window.addEventListener('resize', calculateTotalPages);
    return () => {
      window.removeEventListener('resize', calculateTotalPages);
    };
  }, [data]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Function to handle print
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className={`paginated-proposal-container ${className}`}>
      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-4 print:hidden" data-pdf-remove="true">
        <Button 
          variant="outline" 
          onClick={handlePrevPage} 
          disabled={currentPage === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages}
          className="flex items-center gap-2"
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Pages Container */}
      <div className="pages-container overflow-hidden">
        {/* Pages wrapper with horizontal scroll based on current page */}
        <div 
          className="pages-wrapper flex transition-transform duration-300"
          style={{ 
            transform: `translateX(-${(currentPage - 1) * 100}%)`, 
            width: `${totalPages * 100}%`
          }}
        >
          {/* Each page is a separate container */}
          <div 
            className="proposal-page relative flex-1"
            style={{ backgroundColor: colors.background }}
            ref={el => pageRefs.current[0] = el}
          >
            {/* Header with Logo */}
            <HeaderSection 
              showHeader={true} 
              showLogo={true}
              discountedValue={data.discountedValue || '0,00'}
              colors={colors}
              totalDebt={data.totalDebt}
            />
            
            {/* Main content - first part */}
            <div className="proposal-page-content p-4">
              <ProposalContent 
                data={data}
                companyData={companyData}
                isPreview={true}
                paginationMode="first-page"
              />
            </div>
            
            {/* Page number indicator */}
            <div className="absolute bottom-2 right-4 text-xs text-gray-500">
              Página 1 de {totalPages}
            </div>
          </div>
          
          {/* Conditional rendering for additional pages */}
          {totalPages > 1 && (
            <div 
              className="proposal-page relative flex-1"
              style={{ backgroundColor: colors.background }}
              ref={el => pageRefs.current[1] = el}
            >
              {/* Content for second page */}
              <div className="proposal-page-content p-4">
                <ProposalContent 
                  data={data}
                  companyData={companyData}
                  isPreview={true}
                  paginationMode="additional-page"
                  pageNumber={2}
                />
              </div>
              
              {/* Page number indicator */}
              <div className="absolute bottom-2 right-4 text-xs text-gray-500">
                Página 2 de {totalPages}
              </div>
            </div>
          )}
          
          {/* Conditional rendering for third page */}
          {totalPages > 2 && (
            <div 
              className="proposal-page relative flex-1"
              style={{ backgroundColor: colors.background }}
              ref={el => pageRefs.current[2] = el}
            >
              {/* Content for third page */}
              <div className="proposal-page-content p-4">
                <ProposalContent 
                  data={data}
                  companyData={companyData}
                  isPreview={true}
                  paginationMode="additional-page"
                  pageNumber={3}
                />
              </div>
              
              {/* Page number indicator */}
              <div className="absolute bottom-2 right-4 text-xs text-gray-500">
                Página 3 de {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaginatedProposalView;
