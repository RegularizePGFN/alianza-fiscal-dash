import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProposalsHeader from "./components/ProposalsHeader";
import ProposalsTabs from "./components/ProposalsTabs";
import MainTabsBar, { MainProposalTab } from "./components/MainTabsBar";
import HistoryTabContent from "./components/HistoryTabContent";
import { useProposalsStateWithFilter } from "@/hooks/proposals/useProposalsStateWithFilter";
import { useProposalHandlers } from "@/hooks/proposals";
import { supabase } from "@/integrations/supabase/client";
import { analyzeImageWithAI } from "@/lib/services/vision";
import { toast } from "sonner";

const ProposalsContainer = () => {
  const proposalsState = useProposalsStateWithFilter();
  const [mainTab, setMainTab] = useState<MainProposalTab>("generate");
  const [searchParams, setSearchParams] = useSearchParams();
  const handoffDone = useRef<string | null>(null);

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

  // Cadastro → Simulação handoff: fetch first attachment + prefill client, run AI
  useEffect(() => {
    const cadastroId = searchParams.get("cadastroId");
    if (!cadastroId || handoffDone.current === cadastroId) return;
    handoffDone.current = cadastroId;

    (async () => {
      try {
        // Sempre começa no Passo 1 (Upload) para o usuário ver o print + progresso
        proposalsState.setActiveTab("upload");

        const [{ data: reg }, { data: atts }] = await Promise.all([
          supabase.from("client_registrations").select("*").eq("id", cadastroId).maybeSingle(),
          supabase
            .from("client_registration_attachments")
            .select("*")
            .eq("registration_id", cadastroId)
            .order("uploaded_at", { ascending: true }),
        ]);
        if (!reg) {
          toast.error("Cadastro não encontrado");
          return;
        }

        // Pré-preenche os dados do cliente vindos do cadastro
        proposalsState.setFormData((prev: any) => ({
          ...prev,
          cnpj: reg.cnpj || prev.cnpj || "",
          clientName: reg.client_name || prev.clientName || "",
          clientPhone: reg.client_phone || prev.clientPhone || "",
          clientEmail: (reg as any).client_email || prev.clientEmail || "",
        }));

        const first = (atts || [])[0];
        if (!first) {
          toast.info("Cadastro sem prints. Faça o upload manual.");
          setSearchParams({}, { replace: true });
          return;
        }

        // Baixa o print e já mostra como preview no Passo 1 enquanto a IA processa
        proposalsState.setProcessing(true);
        proposalsState.setProgressPercent(0);

        const res = await fetch(first.file_url);
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });

        // Mostra o print já no preview do Passo 1
        proposalsState.setImagePreview(base64);

        const extracted = await analyzeImageWithAI(
          base64,
          proposalsState.setProgressPercent,
          proposalsState.setProcessingStatus
        );

        // handleProcessComplete faz o merge dos dados extraídos e avança para Passo 2
        handlers.handleProcessComplete(extracted, base64);

        // Garante que o CNPJ e dados do cliente do cadastro prevaleçam
        // (o print normalmente não contém CNPJ)
        proposalsState.setFormData((prev: any) => ({
          ...prev,
          cnpj: reg.cnpj || prev.cnpj || "",
          clientName: reg.client_name || prev.clientName || "",
          clientPhone: reg.client_phone || prev.clientPhone || "",
          clientEmail: (reg as any).client_email || prev.clientEmail || "",
        }));

        toast.success("Simulação carregada do cadastro");
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Erro ao carregar simulação do cadastro");
      } finally {
        proposalsState.setProcessing(false);
        setSearchParams({}, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
