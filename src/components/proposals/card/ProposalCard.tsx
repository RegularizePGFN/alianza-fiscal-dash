
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import ProposalContent from './ProposalContent';
import { useToast } from "@/hooks/use-toast";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdf-utils";
import ActionButtons from "./ActionButtons";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
}

const ProposalCard = ({ data, companyData }: ProposalCardProps) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Calculate how many pages we'll have based on data
  useEffect(() => {
    // Set default to 1 page (main content)
    let pages = 1;
    
    // Add payment schedule page if we have dates
    try {
      const entryDates = data.entryDates ? JSON.parse(data.entryDates) : [];
      const installmentDates = data.installmentDates ? JSON.parse(data.installmentDates) : [];
      
      if (entryDates.length > 0 || installmentDates.length > 0) {
        // Add one page for payment schedule
        pages++;
      }
    } catch (error) {
      console.error('Error parsing payment dates:', error);
    }
    
    setTotalPages(pages);
  }, [data]);
  
  // Effect to verify when fonts are loaded
  useEffect(() => {
    document.fonts.ready.then(() => {
      console.log('All fonts loaded for proposal rendering');
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Page navigation above the proposal */}
      <div className="flex justify-between items-center w-full max-w-full px-4" data-pdf-remove="true">
        <p className="text-sm text-gray-500">
          Página {currentPage + 1} de {totalPages}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink 
                onClick={prevPage} 
                className={`cursor-pointer ${currentPage === 0 ? 'pointer-events-none opacity-50' : ''}`}
              >
                Anterior
              </PaginationLink>
            </PaginationItem>
            {totalPages > 1 && Array.from({length: totalPages}).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  onClick={() => setCurrentPage(i)} 
                  isActive={currentPage === i}
                  className="cursor-pointer"
                  data-page={i}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationLink 
                onClick={nextPage} 
                className={`cursor-pointer ${currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                Próxima
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Main proposal card with better sizing to fit content */}
      <Card 
        ref={proposalRef} 
        className="shadow border overflow-y-auto font-['Roboto',sans-serif] w-full mx-auto bg-white"
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          minHeight: '600px'
        }}
      >
        <CardContent className="p-0">
          {/* Use the shared ProposalContent component with page prop */}
          <ProposalContent 
            data={data}
            companyData={companyData}
            currentPage={currentPage}
          />
        </CardContent>
      </Card>
      
      {/* Action buttons - outside the proposal card */}
      <ActionButtons
        onPrint={handlePrint}
        proposalData={data}
        proposalRef={proposalRef}
      />
    </div>
  );
};

export default ProposalCard;
