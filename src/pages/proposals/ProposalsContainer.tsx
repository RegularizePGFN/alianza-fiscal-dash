
import { RefreshCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProposalsHeader from "./components/ProposalsHeader";
import ProposalsTabs from "./components/ProposalsTabs";
import { useProposalsState } from "@/hooks/proposals";
import { useProposalHandlers } from "@/hooks/proposals";
import { ProposalsDashboard } from "@/components/proposals/dashboard";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

const ProposalsContainer = () => {
  // Get state from our custom hook
  const proposalsState = useProposalsState();
  const { user, originalUser } = useAuth();
  
  // Check if current user is admin or if original user is admin (for impersonation)
  const isAdmin = user?.role === UserRole.ADMIN || originalUser?.role === UserRole.ADMIN;
  
  // Get handlers from our custom hook
  const handlers = useProposalHandlers({
    formData: proposalsState.formData,
    setFormData: proposalsState.setFormData,
    imagePreview: proposalsState.imagePreview,
    setImagePreview: proposalsState.setImagePreview,
    setGeneratedProposal: proposalsState.setGeneratedProposal,
    selectedProposal: proposalsState.selectedProposal,
    setSelectedProposal: proposalsState.setSelectedProposal,
    setActiveTab: proposalsState.setActiveTab,
    setCompanyData: proposalsState.setCompanyData,
    saveProposal: proposalsState.saveProposal,
    fetchProposals: proposalsState.fetchProposals,
    deleteProposal: proposalsState.deleteProposal,
    user: proposalsState.user,
  });
  
  // Mostrar dashboard apenas na aba "upload"
  const shouldShowDashboard = isAdmin && proposalsState.activeTab === "upload";
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <ProposalsHeader />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => proposalsState.fetchProposals()}
            disabled={proposalsState.loadingProposals}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            onClick={handlers.handleReset}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Button>
        </div>
      </div>
      
      <ProposalsTabs 
        activeTab={proposalsState.activeTab} 
        setActiveTab={proposalsState.setActiveTab} 
        formData={proposalsState.formData} 
        generatedProposal={proposalsState.generatedProposal} 
        processing={proposalsState.processing} 
        setProcessing={proposalsState.setProcessing} 
        progressPercent={proposalsState.progressPercent} 
        setProgressPercent={proposalsState.setProgressPercent} 
        companyData={proposalsState.companyData} 
        imagePreview={proposalsState.imagePreview} 
        selectedProposal={proposalsState.selectedProposal} 
        proposals={proposalsState.proposals} 
        loadingProposals={proposalsState.loadingProposals} 
        onInputChange={handlers.handleInputChange} 
        onGenerateProposal={handlers.handleGenerateProposal} 
        onViewProposal={handlers.handleViewProposal} 
        onDeleteProposal={handlers.handleDeleteProposal}
        onProcessComplete={handlers.handleProcessComplete} 
        onReset={handlers.handleReset}
        setProcessingStatus={proposalsState.setProcessingStatus}
      />
      
      {/* Mostrar o dashboard apenas na aba "upload" */}
      {shouldShowDashboard && <ProposalsDashboard />}
    </div>
  );
};

export default ProposalsContainer;
