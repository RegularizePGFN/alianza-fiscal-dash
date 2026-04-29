
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";
import { ChangeEvent } from "react";

import UploadTabContent from "./tabs/UploadTabContent";
import DataTabContent from "./tabs/DataTabContent";
import ProposalTabContent from "./tabs/ProposalTabContent";
import ProposalsStepper, { ProposalStep } from "./ProposalsStepper";

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
  onInputChange: (nameOrEvent: string | ChangeEvent<HTMLInputElement>, value?: string) => void;
  onGenerateProposal: () => Promise<void>;
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
  onInputChange,
  onGenerateProposal,
  onProcessComplete,
  onReset,
  setProcessingStatus,
}: ProposalsTabsProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
  };

  const canGoToData = !!formData.cnpj || generatedProposal;
  const canGoToProposal = !!formData.cnpj || generatedProposal;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="mb-6">
        <ProposalsStepper
          activeStep={activeTab as ProposalStep}
          onStepChange={(s) => setActiveTab(s)}
          canGoToData={canGoToData}
          canGoToProposal={canGoToProposal}
        />
      </div>

      <TabsContent value="upload" className="space-y-6 animate-fade-in">
        <UploadTabContent
          processing={processing}
          setProcessing={setProcessing}
          progressPercent={progressPercent}
          setProgressPercent={setProgressPercent}
          onProcessComplete={onProcessComplete}
          setProcessingStatus={setProcessingStatus}
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
