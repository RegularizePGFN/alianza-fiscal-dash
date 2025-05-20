
import React, { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ProposalCard } from "@/components/proposals/card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { PDFTemplatePreview } from "@/components/proposals/pdf-editor";

interface ProposalTabContentProps {
  formData: Partial<ExtractedData>;
  imagePreview: string | null;
  companyData: CompanyData | null;
  onReset: () => void;
  onInputChange: (nameOrEvent: string | React.ChangeEvent<HTMLInputElement>, value?: string) => void;
}

const ProposalTabContent = ({
  formData,
  imagePreview,
  companyData,
  onReset,
  onInputChange
}: ProposalTabContentProps) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  // Add state to track active tab
  const [activeTab, setActiveTab] = useState("preview");
  
  const handlePrint = useReactToPrint({
    content: () => proposalRef.current,
    documentTitle: `Proposta_${formData.cnpj || 'cliente'}`
  });
  
  useEffect(() => {
    // Scroll to the top when the tab is shown
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
      {/* Editor panel (left side) */}
      <div className="md:col-span-2">
        <div className="sticky top-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Personalização da Proposta</h3>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Detalhes da Proposta</h4>
                  
                  {/* Simple form fields instead of complex EditorTabs */}
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="companyName" className="text-sm font-medium block mb-1">
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        className="w-full p-2 border rounded"
                        value={formData.companyName || ''}
                        onChange={e => onInputChange(e)}
                        name="companyName"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="specialistName" className="text-sm font-medium block mb-1">
                        Especialista
                      </label>
                      <input
                        type="text"
                        id="specialistName"
                        className="w-full p-2 border rounded"
                        value={formData.specialistName || ''}
                        onChange={e => onInputChange(e)}
                        name="specialistName"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={onReset} 
                  className="w-full mt-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Preview panel (right side) */}
      <div className="md:col-span-5" ref={proposalRef}>
        <ProposalCard 
          data={formData} 
          imageUrl={imagePreview || undefined}
          companyData={companyData}
        />
      </div>
    </div>
  );
};

export default ProposalTabContent;
