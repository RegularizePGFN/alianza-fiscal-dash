import { useState } from "react";
import { RefreshCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProposalsHeader from "./components/ProposalsHeader";
import ProposalsTabs from "./components/ProposalsTabs";
import MainTabsBar, { MainProposalTab } from "./components/MainTabsBar";
import HistoryTabContent from "./components/HistoryTabContent";
import { useProposalsStateWithFilter } from "@/hooks/proposals/useProposalsStateWithFilter";
import { useProposalHandlers } from "@/hooks/proposals";

const ProposalsContainer = () => {
  const proposalsState = useProposalsStateWithFilter();
  const [mainTab, setMainTab] = useState<MainProposalTab>("generate");

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

  // Quando o usuário clica em "Nova Proposta" no histórico, voltar para a aba gerar
  const handleNewProposal = () => {
    handlers.handleReset();
    setMainTab("generate");
  };

  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <ProposalsHeader />
        <div className="flex gap-2">
          {mainTab === "history" && (
            <Button
              variant="outline"
              onClick={() => proposalsState.fetchProposals()}
              disabled={proposalsState.loadingProposals}
              className="flex items-center gap-2 border-af-blue-300 hover:bg-af-blue-100 hover:text-af-blue-700 transition-all shadow-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </Button>
          )}
          <Button
            onClick={handleNewProposal}
            className="flex items-center gap-2 bg-af-blue-700 text-white hover:bg-af-blue-800 shadow-md"
          >
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <MainTabsBar activeTab={mainTab} onChange={setMainTab} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
        {mainTab === "generate" && (
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
            onInputChange={handlers.handleInputChange}
            onGenerateProposal={handlers.handleGenerateProposal}
            onProcessComplete={handlers.handleProcessComplete}
            onReset={handlers.handleReset}
            setProcessingStatus={proposalsState.setProcessingStatus}
          />
        )}

        {mainTab === "history" && (
          <HistoryTabContent
            proposals={proposalsState.proposals}
            loadingProposals={proposalsState.loadingProposals}
            onViewProposal={handlers.handleViewProposal}
            onDeleteProposal={handlers.handleDeleteProposal}
            filterType={proposalsState.filterType}
            customDateRange={proposalsState.customDateRange}
            onFilterChange={proposalsState.handleFilterChange}
            onMount={proposalsState.ensureProposalsLoaded}
          />
        )}
      </div>
    </div>
  );
};

export default ProposalsContainer;
