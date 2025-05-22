
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import ProposalContent from './ProposalContent';
import { useToast } from "@/hooks/use-toast";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdfUtils";
import { Button } from "@/components/ui/button";
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
  
  // Get colors from template settings or use defaults
  const colors = {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#10B981',
    background: '#F8FAFC'
  };

  // Default layout settings
  const layout = {
    sections: ['client', 'debt', 'payment', 'fees', 'total'],
    showHeader: true,
    showLogo: true,
    showWatermark: false
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    if (!proposalRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando PDF, aguarde um momento...",
    });
    
    try {
      await generateProposalPdf(proposalRef.current, data);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleGeneratePng = async () => {
    if (!proposalRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem PNG. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando imagem PNG de alta qualidade, aguarde...",
    });
    
    try {
      await generateProposalPng(proposalRef.current, data);
      
      toast({
        title: "Sucesso",
        description: "Imagem PNG gerada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PNG:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem PNG. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  // Calculate A4 dimensions for the preview (210mm × 297mm)
  // Using a scaling factor to fit properly on screen
  const a4Width = 210 * 3.7795 * 0.75; // A4 width in pixels with 0.75 scale
  const a4Height = 297 * 3.7795 * 0.75; // A4 height in pixels with 0.75 scale

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

      {/* Main proposal card with larger scale */}
      <Card 
        ref={proposalRef} 
        className="shadow border overflow-hidden font-['Roboto',sans-serif] w-full mx-auto bg-white"
        style={{ 
          width: `${a4Width}px`, 
          height: `${a4Height}px`,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        <CardContent className="p-0 h-full">
          {/* Use the shared ProposalContent component with page prop */}
          <ProposalContent 
            data={data}
            companyData={companyData}
            currentPage={currentPage}
          />
        </CardContent>
      </Card>
      
      {/* Action buttons - now outside the proposal card */}
      <div className="flex justify-center gap-3 py-4 w-full" data-pdf-remove="true">
        <Button variant="outline" onClick={handlePrint} className="border-gray-300 text-gray-700 hover:bg-gray-50">
          Imprimir
        </Button>
        <Button variant="outline" onClick={handleGeneratePng} className="border-gray-300 text-gray-700 hover:bg-gray-50">
          Baixar PNG
        </Button>
        <Button onClick={handleGeneratePdf} className="bg-gray-800 hover:bg-gray-900">
          Baixar PDF
        </Button>
      </div>
    </div>
  );
};

export default ProposalCard;
