
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIImageProcessor from "@/components/proposals/AIImageProcessor";
import DataForm from "@/components/proposals/DataForm";
import ProposalCard from "@/components/proposals/ProposalCard";
import ProposalHistory from "@/components/proposals/ProposalHistory";
import { ExtractedData, Proposal } from "@/lib/types/proposals";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

const ProposalsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("upload");
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [formData, setFormData] = useState<Partial<ExtractedData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<boolean>(false);
  
  // For history tab example data
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const handleProcessComplete = (data: Partial<ExtractedData>, preview: string) => {
    setFormData(data);
    setImagePreview(preview);
    setActiveTab("data");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateProposal = () => {
    setGeneratedProposal(true);
    
    // In a real app, we would save the proposal to a database
    const newProposal: Proposal = {
      id: `proposal-${Date.now()}`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown User',
      createdAt: new Date().toISOString(),
      data: formData as ExtractedData,
      imageUrl: imagePreview || '',
    };
    
    // Add to history
    setProposals(prev => [newProposal, ...prev]);
    
    toast({
      title: "Proposta gerada",
      description: "Sua proposta foi gerada com sucesso!"
    });
    
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
    setProposals(prev => prev.filter(p => p.id !== id));
    
    // If the deleted proposal was selected, clear it
    if (selectedProposal?.id === id) {
      setSelectedProposal(null);
      setGeneratedProposal(false);
      setFormData({});
      setImagePreview(null);
      setActiveTab("upload");
    }
    
    return Promise.resolve(); // Simulate async operation
  };

  const handleReset = () => {
    setFormData({});
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
