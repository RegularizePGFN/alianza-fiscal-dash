
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import DataForm from "@/components/proposals/DataForm";
import ProposalCard from "@/components/proposals/ProposalCard";
import ProposalHistory from "@/components/proposals/ProposalHistory";
import { ExtractedData, Proposal } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useSaveProposal, useFetchProposals } from "@/hooks/proposals";

const ProposalsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveProposal } = useSaveProposal();
  const { proposals, isLoading: loadingProposals, fetchProposals, deleteProposal } = useFetchProposals();

  const [activeTab, setActiveTab] = useState("upload");
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [formData, setFormData] = useState<Partial<ExtractedData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<boolean>(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Preencher dados do usuário no formulário
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        clientName: user.name || '',
        clientEmail: user.email || '',
        clientPhone: '', // Preenchido pelo usuário se necessário
      }));
    }
  }, [user]);

  const handleProcessComplete = (data: Partial<ExtractedData>, preview: string) => {
    setFormData(prev => ({
      ...prev,
      ...data,
      // Garantir que os dados do usuário atual sejam mantidos
      clientName: data.clientName || user?.name || prev.clientName || '',
      clientEmail: data.clientEmail || user?.email || prev.clientEmail || '',
    }));
    setImagePreview(preview);
    setActiveTab("data");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateProposal = async () => {
    setGeneratedProposal(true);
    
    // Salvar a proposta no Supabase
    if (formData) {
      const proposal = await saveProposal(formData as ExtractedData, imagePreview || undefined);
      
      if (proposal) {
        // Em caso de sucesso, atualize a lista de propostas
        fetchProposals();
        setSelectedProposal(proposal);
        toast({
          title: "Proposta gerada",
          description: "Sua proposta foi gerada e armazenada com sucesso!"
        });
      }
    }
    
    setActiveTab("proposal");
  };

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setFormData(proposal.data);
    setImagePreview(proposal.imageUrl);
    setGeneratedProposal(true);
    setActiveTab("proposal");
  };

  const handleDeleteProposal = async (id: string) => {
    const success = await deleteProposal(id);
    
    // Se a proposta excluída era a selecionada, limpar o state
    if (success && selectedProposal?.id === id) {
      setSelectedProposal(null);
      setGeneratedProposal(false);
      setFormData({});
      setImagePreview(null);
      setActiveTab("upload");
    }
    
    return success;
  };

  const handleReset = () => {
    setFormData({
      clientName: user?.name || '',
      clientEmail: user?.email || '',
      clientPhone: '',
    });
    setImagePreview(null);
    setGeneratedProposal(false);
    setSelectedProposal(null);
    setActiveTab("upload");
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Propostas PGFN</h1>
            <p className="text-muted-foreground">
              Crie, gerencie e exporte propostas de parcelamento PGFN.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upload">Upload de Imagem</TabsTrigger>
            <TabsTrigger value="data" disabled={!formData.cnpj && !generatedProposal}>Dados Extraídos</TabsTrigger>
            <TabsTrigger value="proposal" disabled={!generatedProposal}>Proposta Gerada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <AIImageProcessor
                  onProcessComplete={handleProcessComplete}
                  processing={processing}
                  setProcessing={setProcessing}
                  progressPercent={progressPercent}
                  setProgressPercent={setProgressPercent}
                />
              </div>
              
              <div className="md:col-span-1">
                <ProposalHistory
                  proposals={proposals}
                  isLoading={loadingProposals}
                  onViewProposal={handleViewProposal}
                  onDeleteProposal={handleDeleteProposal}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <DataForm
              formData={formData}
              processing={processing}
              onInputChange={handleInputChange}
              onGenerateProposal={handleGenerateProposal}
            />
          </TabsContent>
          
          <TabsContent value="proposal" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={handleReset}>
                Criar Nova Proposta
              </Button>
            </div>
            <ProposalCard
              data={formData}
              imageUrl={imagePreview || undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProposalsPage;
