
import { useState } from 'react';
import ProposalsTabs from './components/ProposalsTabs';
import ProposalsHeader from './components/ProposalsHeader';
import { 
  useProposalsState, 
  useSaveProposal,
  useFetchProposals, 
  useProposalHandlers 
} from '@/hooks/proposals';

const ProposalsContainer = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const proposalsState = useProposalsState();
  
  const {
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    processing,
    setProcessing,
    progressPercent,
    setProgressPercent,
    imagePreview,
    setImagePreview,
    generatedProposal,
    setGeneratedProposal,
    selectedProposal,
    setSelectedProposal,
    companyData,
    setCompanyData,
    processingStatus,
    setProcessingStatus,
    user,
    proposals,
    loadingProposals,
    saveProposal,
    fetchProposals,
    deleteProposal,
  } = proposalsState;

  const proposalHandlers = useProposalHandlers({
    formData,
    setFormData,
    imagePreview,
    setImagePreview,
    setGeneratedProposal,
    selectedProposal,
    setSelectedProposal,
    setActiveTab,
    setCompanyData,
    saveProposal,
    fetchProposals,
    deleteProposal,
    user,
  });

  const {
    handleProcessComplete,
    handleInputChange,
    handleGenerateProposal,
    handleViewProposal,
    handleDeleteProposal,
    handleReset
  } = proposalHandlers;

  const handleRefresh = () => {
    // Trigger a refresh of the proposal data
    setRefreshKey(prev => prev + 1);
    fetchProposals();
  };

  // Create a handler for creating a new proposal
  const handleCreateNew = () => {
    handleReset();
  };

  return (
    <div className="space-y-6">
      <ProposalsHeader 
        onClickNew={handleCreateNew}
        onClickRefresh={handleRefresh}
      />
      <ProposalsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        generatedProposal={generatedProposal}
        processing={processing}
        setProcessing={setProcessing}
        progressPercent={progressPercent}
        setProgressPercent={setProgressPercent}
        companyData={companyData}
        imagePreview={imagePreview}
        selectedProposal={selectedProposal}
        proposals={proposals}
        loadingProposals={loadingProposals}
        onInputChange={handleInputChange}
        onGenerateProposal={handleGenerateProposal}
        onViewProposal={handleViewProposal}
        onDeleteProposal={handleDeleteProposal}
        onProcessComplete={handleProcessComplete}
        onReset={handleReset}
        setProcessingStatus={setProcessingStatus}
      />
    </div>
  );
};

export default ProposalsContainer;
