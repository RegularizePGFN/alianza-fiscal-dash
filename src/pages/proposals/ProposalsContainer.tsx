
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
  
  const {
    activeTab,
    setActiveTab,
  } = useProposalsState();

  const { handleCreateProposal } = useProposalHandlers({});

  const handleRefresh = () => {
    // Trigger a refresh of the proposal data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Pass the required props to ProposalsHeader */}
      <ProposalsHeader 
        onClickNew={handleCreateProposal}
        onClickRefresh={handleRefresh}
      />
      <ProposalsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        refreshKey={refreshKey}
      />
    </div>
  );
};

export default ProposalsContainer;
