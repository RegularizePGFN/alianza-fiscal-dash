
import { useState } from 'react';
import { ProposalsTabs } from './components/ProposalsTabs';
import { ProposalsHeader } from './components/ProposalsHeader';
import { 
  useProposalsState, 
  useSaveProposal,
  useFetchProposals, 
  useProposalHandlers 
} from '@/hooks/proposals';

const ProposalsContainer = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const {
    proposalState,
    setProposalState,
    activeTab,
    setActiveTab,
    isLoading,
  } = useProposalsState();

  const { handleCreateNewProposal } = useProposalHandlers({
    proposalState,
    setProposalState,
    setActiveTab,
  });

  const handleRefresh = () => {
    // Trigger a refresh of the proposal data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Pass the required props to ProposalsHeader */}
      <ProposalsHeader 
        onClickNew={handleCreateNewProposal}
        onClickRefresh={handleRefresh}
      />
      <ProposalsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        proposalState={proposalState}
        setProposalState={setProposalState}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProposalsContainer;
