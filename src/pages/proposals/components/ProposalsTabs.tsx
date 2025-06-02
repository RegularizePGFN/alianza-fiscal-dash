
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import UploadTabContent from "./tabs/UploadTabContent";
import DataTabContent from "./tabs/DataTabContent";
import ProposalTabContent from "./tabs/ProposalTabContent";
import { ExtractedData, Proposal, CompanyData } from "@/lib/types/proposals";

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
  onInputChange: (field: string, value: string) => void;
  onGenerateProposal: () => void;
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
  onDeleteProposal,
  onProcessComplete,
  onReset,
  setProcessingStatus,
}: ProposalsTabsProps) => {
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Convert field/value handler to event handler for DataTabContent
  const handleDataInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onInputChange(name, value);
  };

  console.log('ProposalsTabs - processing:', processing, 'progressPercent:', progressPercent);
  console.log('ProposalsTabs - formData has data:', Object.keys(formData).length > 0);
  console.log('ProposalsTabs - imagePreview exists:', !!imagePreview);

  // Check if we have extracted data (either from image processing or selected proposal)
  const hasExtractedData = (formData && Object.keys(formData).length > 2) || selectedProposal;
  
  return (
    <Card className="shadow-md">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upload" className="relative">
            Upload & Análise
            {processing && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                Processando
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="data" disabled={!hasExtractedData}>
            Dados Extraídos
            {hasExtractedData && (
              <Badge variant="default" className="ml-2">
                ✓
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="proposal" disabled={!generatedProposal && !selectedProposal}>
            Proposta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <UploadTabContent
            imagePreview={imagePreview}
            processing={processing}
            progressPercent={progressPercent}
            companyData={companyData}
            proposals={proposals}
            loadingProposals={loadingProposals}
            onProcessComplete={onProcessComplete}
            onDeleteProposal={onDeleteProposal}
            setProcessingStatus={setProcessingStatus}
            setProcessing={setProcessing}
            setProgressPercent={setProgressPercent}
          />
        </TabsContent>

        <TabsContent value="data">
          {loadingProposals ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <DataTabContent
              formData={formData}
              processing={processing}
              onInputChange={handleDataInputChange}
              onGenerateProposal={onGenerateProposal}
              setProcessingStatus={setProcessingStatus}
            />
          )}
        </TabsContent>

        <TabsContent value="proposal">
          {loadingProposals ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <ProposalTabContent
              formData={formData}
              onInputChange={onInputChange}
              onReset={onReset}
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProposalsTabs;
