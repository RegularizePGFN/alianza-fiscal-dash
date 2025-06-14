
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { ChangeEvent } from "react";
import { DateFilterType, DateRange } from "@/components/proposals/ProposalsDateFilter";

import UploadTabContent from "./tabs/UploadTabContent";
import DataTabContent from "./tabs/DataTabContent";
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
  onGenerateProposal: () => Promise<void>;
  onViewProposal: (proposal: Proposal) => void;
  onDeleteProposal: (id: string) => Promise<boolean>;
  onProcessComplete: (data: Partial<ExtractedData>, preview: string) => void;
  onReset: () => void;
  setProcessingStatus: (status: string) => void;
  filterType: DateFilterType;
  customDateRange: DateRange;
  onFilterChange: (type: DateFilterType, range?: DateRange) => void;
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
  setProcessingStatus,
  filterType,
  customDateRange,
  onFilterChange
}: ProposalsTabsProps) => {
  // Create a function that adapts onInputChange to the format expected by DataTabContent
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 mb-6 bg-af-blue-50 rounded-lg shadow-sm overflow-hidden">
        <TabsTrigger 
          value="upload" 
          className={
            activeTab === "upload"
              ? "bg-af-blue-600 text-white font-semibold shadow"
              : ""
          }
        >
          Upload de Imagem
        </TabsTrigger>
        <TabsTrigger 
          value="data" 
          disabled={!formData.cnpj && !generatedProposal}
          className={
            activeTab === "data"
              ? "bg-af-blue-600 text-white font-semibold shadow"
              : ""
          }
        >
          Dados Extraídos
        </TabsTrigger>
        <TabsTrigger 
          value="proposal" 
          disabled={!formData.cnpj && !generatedProposal}
          className={
            activeTab === "proposal"
              ? "bg-af-blue-600 text-white font-semibold shadow"
              : ""
          }
        >
          Proposta
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="space-y-6 animate-fade-in">
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
          filterType={filterType}
          customDateRange={customDateRange}
          onFilterChange={onFilterChange}
        />
      </TabsContent>
      
      <TabsContent value="data" className="space-y-6 animate-fade-in">
        <DataTabContent
          formData={formData}
          processing={processing}
          onInputChange={handleInputChange}
          onGenerateProposal={onGenerateProposal}
          setProcessingStatus={setProcessingStatus}
        />
      </TabsContent>

      <TabsContent value="proposal" className="space-y-6 animate-fade-in">
        <ProposalTabContent
          formData={formData}
          imagePreview={imagePreview}
          companyData={companyData}
          onReset={onReset}
          onInputChange={onInputChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProposalsTabs;
