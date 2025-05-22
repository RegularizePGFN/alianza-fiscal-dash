
import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ExtractedData, PDFTemplate, CompanyData } from '@/lib/types/proposals';
import ProposalContent from '../card/ProposalContent';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

interface PDFTemplatePreviewProps {
  formData: Partial<ExtractedData>;
  template: PDFTemplate;
  imagePreview: string | null;
  companyData?: CompanyData | null;
}

const PDFTemplatePreview = ({ 
  formData, 
  template, 
  imagePreview,
  companyData 
}: PDFTemplatePreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Calculate total pages based on data
  React.useEffect(() => {
    let pages = 1; // Start with one page (main content)
    
    // Check if we have payment schedule data
    try {
      const entryDates = formData.entryDates ? JSON.parse(formData.entryDates) : [];
      const installmentDates = formData.installmentDates ? JSON.parse(formData.installmentDates) : [];
      
      if (entryDates.length > 0 || installmentDates.length > 0) {
        pages++;
      }
    } catch (error) {
      console.error('Error parsing payment dates:', error);
    }
    
    setTotalPages(pages);
  }, [formData]);
  
  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Parse template colors from formData or use defaults from selected template
  const colors = (() => {
    if (formData.templateColors && typeof formData.templateColors === 'string') {
      try {
        return JSON.parse(formData.templateColors);
      } catch (e) {
        console.error('Failed to parse template colors', e);
      }
    }
    
    return {
      primary: template.primaryColor,
      secondary: template.secondaryColor,
      accent: template.accentColor,
      background: template.backgroundColor
    };
  })();

  // Parse layout settings
  const layout = (() => {
    if (formData.templateLayout && typeof formData.templateLayout === 'string') {
      try {
        return JSON.parse(formData.templateLayout);
      } catch (e) {
        console.error('Failed to parse template layout', e);
      }
    }
    
    return {
      sections: template.defaultLayout,
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  })();

  // A4 dimensions in pixels with a 0.75 scale factor (larger than before)
  const a4Width = 210 * 3.7795 * 0.75;
  const a4Height = 297 * 3.7795 * 0.75;

  return (
    <div className="flex flex-col items-center">
      {/* Page navigation */}
      <div className="flex justify-between items-center w-full max-w-full mb-2">
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
            {totalPages > 2 && Array.from({length: totalPages}).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  onClick={() => setCurrentPage(i)} 
                  isActive={currentPage === i}
                  className="cursor-pointer"
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
      
      <Card 
        ref={previewRef} 
        className="border p-0 overflow-hidden shadow-md preview-proposal font-['Roboto',sans-serif] transition-colors mx-auto"
        style={{ 
          backgroundColor: colors.background,
          width: `${a4Width}px`,
          height: `${a4Height}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: '210/297', // Proporção A4
        }}
      >
        {/* Use the shared ProposalContent component for consistency, with current page */}
        <div className="overflow-auto h-full">
          <ProposalContent 
            data={formData}
            companyData={companyData}
            isPreview={true}
            currentPage={currentPage}
          />
        </div>
      </Card>
    </div>
  );
};

export default PDFTemplatePreview;
