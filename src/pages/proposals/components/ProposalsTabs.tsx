
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { ChangeEvent } from "react";

import UploadTabContent from "./tabs/UploadTabContent";
import DataTabContent from "./tabs/DataTabContent";
import PDFEditorTabContent from "./tabs/PDFEditorTabContent";
import ProposalTabContent from "./tabs/ProposalTabContent";

interface ProposalsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: Partial<ExtractedData>;
  generatedProposal: boolean;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  progressPercent: number;
  setProgressPercent: (percent: number) => void;
  companyData: CompanyData | null;
  imagePreview: string | null;
  selectedProposal: Proposal | null;
  proposals: Proposal[];
  loadingProposals: boolean;
  onInputChange: (nameOrEvent: string | ChangeEvent<HTMLInputElement>, value?: string) => void;
  onGenerateProposal: () => void;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  onReset: () => void;
  setProcessingStatus: (status: string) => void;
}

const ProposalsTabs = ({
  activeTab,
  setActiveTab,
  formData,
  generatedProposal,
  processing,
  setProcessing,
  progressPercent,
  setProgressPercent,
  companyData,
  imagePreview,
  selectedProposal,
  proposals,
  loadingProposals,
  onInputChange,
  onGenerateProposal,
  onViewProposal,
  onDeleteProposal,
  onProcessComplete,
  onReset,
  setProcessingStatus
}: ProposalsTabsProps) => {
  // Create a function that adapts onInputChange to the format expected by DataTabContent
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
  };

  // Create a wrapper for string-based input changes for PDFEditor
  const handlePDFEditorInputChange = (name: string, value: string) => {
    onInputChange(name, value);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="upload">Upload de Imagem</TabsTrigger>
        <TabsTrigger value="data" disabled={!formData.cnpj && !generatedProposal}>
          Dados Extraídos
        </TabsTrigger>
        <TabsTrigger value="pdf-editor" disabled={!formData.cnpj && !generatedProposal}>
          Edite o PDF
        </TabsTrigger>
        <TabsTrigger value="proposal" disabled={!generatedProposal}>
          Proposta Gerada
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="space-y-6">
        <UploadTabContent
          processing={processing}
          setProcessing={setProcessing}
          progressPercent={progressPercent}
          setProgressPercent={setProgressPercent}
          proposals={proposals}
          loadingProposals={loadingProposals}
          onViewProposal={onViewProposal}
          onDeleteProposal={onDeleteProposal}
          onProcessComplete={onProcessComplete}
          setProcessingStatus={setProcessingStatus}
        />
      </TabsContent>
      
      <TabsContent value="data" className="space-y-6">
        <DataTabContent
          formData={formData}
          processing={processing}
          onInputChange={handleInputChange}
          onGenerateProposal={() => setActiveTab("pdf-editor")}
          setProcessingStatus={setProcessingStatus}
        />
      </TabsContent>

      <TabsContent value="pdf-editor" className="space-y-6">
        <PDFEditorTabContent 
          formData={formData} 
          onInputChange={handlePDFEditorInputChange}
          onGenerateProposal={onGenerateProposal}
          imagePreview={imagePreview || null}
        />
      </TabsContent>
      
      <TabsContent value="proposal" className="space-y-6">
        <ProposalTabContent
          formData={formData}
          imagePreview={imagePreview}
          companyData={companyData}
          onReset={onReset}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProposalsTabs;
